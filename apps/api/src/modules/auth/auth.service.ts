import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { PrismaService } from "../../prisma/prisma.service";
import { MfaService } from "./mfa.service";
import { TokenService } from "./token.service";
import { RedisService } from "../../redis/redis.service";
import { UserRole } from "@naprocs/types";
import { LoginDto } from "./dto/login.dto";
import { MfaVerifyDto } from "./dto/mfa-verify.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mfa: MfaService,
    private readonly tokens: TokenService,
    private readonly redis: RedisService,
  ) { }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { employee: true },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    if (user.status === "SUSPENDED") {
      throw new ForbiddenException("Your account is suspended. Contact HR.");
    }

    if (user.status !== "ACTIVE") {
      throw new ForbiddenException("Your account is not active.");
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const isFirstLogin = !user.lastLoginAt;

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    let isTeamLead = false;
    if (user.employeeId) {
      const tlAssignment = await this.prisma.projectAssignment.findFirst({
        where: { employeeId: user.employeeId, projectRole: 'TL', releasedAt: null },
      });
      if (tlAssignment) isTeamLead = true;
    }

    // Fetch dynamic MFA policy
    const policy = await this.prisma.orgPolicy.findFirst();
    const isMfaRequired = policy?.mfaRequired ?? false;

    // Enforce MFA if org policy requires it, OR if this is the employee's first time logging in
    const enforceMfa = isMfaRequired || isFirstLogin;

    if (enforceMfa) {
      const challenge = await this.mfa.createEmailOtpChallenge(user.id, user.email);
      return {
        success: true,
        mfaRequired: true,
        challengeId: challenge.challengeId,
        method: challenge.method,
      };
    }

    const issued = await this.tokens.issueTokens({
      userId: user.id,
      email: user.email,
      role: isTeamLead ? 'TEAM_LEAD' : (user.role === 'TEAM_LEAD' ? 'EMPLOYEE' : (user.role as any)),
      employeeId: user.employeeId ?? undefined,
      ipAddress,
      userAgent,
    });

    let finalRedirectPath = issued.redirectPath;
    if (user.employee?.status === "ONBOARDING") {
      finalRedirectPath = "/employee/onboarding";
    }

    return {
      success: true,
      mfaRequired: false,
      token: issued.accessToken,
      refreshToken: issued.refreshToken,
      role: issued.role,
      redirectPath: finalRedirectPath,
      employeeId: user.employeeId ?? null,
      isTeamLead,
      employeeStatus: user.employee?.status ?? null,
      isFirstLogin,
    };
  }

  async verifyMfa(dto: MfaVerifyDto, ipAddress?: string, userAgent?: string) {
    const challenge = await this.mfa.verifyChallenge(dto.challengeId, dto.code);
    if (!challenge) {
      throw new UnauthorizedException("Invalid or expired verification code.");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: challenge.userId },
      include: { employee: true },
    });

    if (!user || user.status !== "ACTIVE") {
      throw new ForbiddenException("Account is not allowed to sign in.");
    }

    const isFirstLogin = !user.lastLoginAt;

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const fingerprintString = `${user.id}:${ipAddress || 'unknown'}:${userAgent || 'unknown'}`;
    const fingerprint = crypto.createHash('sha256').update(fingerprintString).digest('hex');

    const device = await this.prisma.device.findFirst({
      where: { userId: user.id, fingerprint, isTrusted: true },
    });

    const isUnknownDevice = !device;

    if (isUnknownDevice) {
      // Store pending device trust request in Redis for the frontend UI
      await this.redis.setJson(`auth:trust_pending:${dto.challengeId}`, {
        userId: user.id,
        fingerprint,
        name: userAgent ? userAgent.substring(0, 255) : 'Unknown Device',
      }, 3600); // 1 hour TTL
    }

    const issued = await this.tokens.issueTokens({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      employeeId: user.employeeId ?? undefined,
      ipAddress,
      userAgent,
    });

    return {
      success: true,
      token: issued.accessToken,
      refreshToken: issued.refreshToken,
      role: issued.role,
      redirectPath: issued.redirectPath,
      employeeId: user.employeeId ?? null,
      unknownDevice: isUnknownDevice,
      isFirstLogin,
    };
  }

  async trustDevice(challengeId: string) {
    const pendingKey = `auth:trust_pending:${challengeId}`;
    const pendingData = await this.redis.getJson<{userId: string, fingerprint: string, name: string}>(pendingKey);
    
    if (!pendingData) {
      throw new UnauthorizedException("Device trust request expired or invalid");
    }

    await this.prisma.device.create({
      data: {
        userId: pendingData.userId,
        fingerprint: pendingData.fingerprint,
        name: pendingData.name,
        isTrusted: true,
      }
    });

    await this.redis.del(pendingKey);
    return { success: true };
  }

  async refreshAuthToken(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token is required.");
    }

    const refreshKey = `auth:refresh:${refreshToken}`;
    
    // B-05: Atomic fetch and delete to prevent token cloning via race conditions
    const redisClient = this.redis.getClient();
    const luaScript = `
      local data = redis.call('GET', KEYS[1])
      if data then
        redis.call('DEL', KEYS[1])
      end
      return data
    `;
    const rawSession = await redisClient.eval(luaScript, 1, refreshKey);

    if (!rawSession) {
      throw new UnauthorizedException("Invalid or expired refresh token.");
    }

    const sessionData = JSON.parse(rawSession as string) as { userId: string; email: string; role: string };

    const user = await this.prisma.user.findUnique({
      where: { id: sessionData.userId },
      include: { employee: true },
    });

    if (!user || user.status !== "ACTIVE") {
      await this.redis.del(refreshKey);
      throw new ForbiddenException("Account is not allowed to sign in.");
    }

    // Revoke old token family (basic rotation)
    await this.redis.del(`auth:session:${user.id}:${refreshToken}`);

    let isTeamLead = false;
    if (user.employeeId) {
      const tlAssignment = await this.prisma.projectAssignment.findFirst({
        where: { employeeId: user.employeeId, projectRole: 'TL', releasedAt: null },
      });
      if (tlAssignment) isTeamLead = true;
    }

    const issued = await this.tokens.issueTokens({
      userId: user.id,
      email: user.email,
      role: isTeamLead ? 'TEAM_LEAD' : (user.role === 'TEAM_LEAD' ? 'EMPLOYEE' : (user.role as any)),
      employeeId: user.employeeId ?? undefined,
    });

    let finalRedirectPath = issued.redirectPath;
    if (user.employee?.status === "ONBOARDING") {
      finalRedirectPath = "/employee/onboarding";
    }

    return {
      success: true,
      token: issued.accessToken,
      refreshToken: issued.refreshToken,
      role: issued.role,
      redirectPath: finalRedirectPath,
      employeeId: user.employeeId ?? null,
      isTeamLead,
      employeeStatus: user.employee?.status ?? null,
    };
  }

  async logout(userId: string, jti?: string, refreshToken?: string) {
    if (jti) {
      // 24h TTL is an approximation based on token validity
      await this.redis.setJson(`auth:revoked:${jti}`, true, 86400);
    }

    if (refreshToken) {
      await this.redis.del(`auth:refresh:${refreshToken}`);
      await this.redis.del(`auth:session:${userId}:${refreshToken}`);
    }

    return { success: true };
  }

  async getActiveSessions(userId: string) {
    const pattern = `auth:session:${userId}:*`;
    const keys = await this.redis.keys(pattern);
    
    const sessions = [];
    for (const key of keys) {
      const data = await this.redis.getJson<any>(key);
      if (data) {
        const parts = key.split(':');
        const refreshToken = parts[parts.length - 1];
        const sessionId = crypto.createHash('sha256').update(refreshToken).digest('hex');
        sessions.push({
          id: sessionId,
          ipAddress: data.ipAddress || 'Authorized IP',
          userAgent: data.userAgent || 'Authorized Session',
          createdAt: data.createdAt,
          lastActive: data.createdAt,
          isCurrent: false,
        });
      }
    }
    
    return sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async revokeSession(userId: string, sessionId: string) {
    const pattern = `auth:session:${userId}:*`;
    const keys = await this.redis.keys(pattern);
    
    for (const key of keys) {
      const parts = key.split(':');
      const refreshToken = parts[parts.length - 1];
      const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      
      if (hash === sessionId) {
        await this.redis.del(`auth:refresh:${refreshToken}`);
        await this.redis.del(key);
        
        // Also remove from concurrent sessions ZSET
        const redisClient = this.redis.getClient();
        await redisClient.zrem(`auth:user_sessions:${userId}`, refreshToken);
        break;
      }
    }
    
    return { success: true };
  }
}
