import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UserRole, getDashboardPathForRole } from "@naprocs/types";
import { v4 as uuidv4 } from "uuid";
import { RedisService } from "../../redis/redis.service";
import { PrismaService } from "../../prisma/prisma.service";

const REFRESH_PREFIX = "auth:refresh:";
const SESSION_PREFIX = "auth:session:";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  role: UserRole;
  redirectPath: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  async issueTokens(params: {
    userId: string;
    email: string;
    role: UserRole;
    employeeId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuthTokens> {
    const jti = uuidv4();
    const payload = {
      sub: params.userId,
      email: params.email,
      role: params.role,
      employeeId: params.employeeId,
      jti,
    };

    const accessToken = await this.jwt.signAsync(payload);
    const refreshToken = uuidv4();
    const refreshTtlDays = 7;
    const refreshTtlSeconds = refreshTtlDays * 24 * 60 * 60;

    await this.redis.setJson(
      `${REFRESH_PREFIX}${refreshToken}`,
      { userId: params.userId, email: params.email, role: params.role },
      refreshTtlSeconds,
    );

    await this.redis.setJson(
      `${SESSION_PREFIX}${params.userId}:${refreshToken}`,
      { 
        createdAt: new Date().toISOString(),
        ipAddress: params.ipAddress,
        userAgent: params.userAgent 
      },
      refreshTtlSeconds,
    );

    // Enforce concurrent sessions limit
    const limitStr = this.config.get<string>("SESSION_MAX_CONCURRENT");
    const limit = limitStr ? parseInt(limitStr, 10) : 3;
    
    const pattern = `${SESSION_PREFIX}${params.userId}:*`;
    const keys = await this.redis.keys(pattern);
    
    if (keys.length > limit) {
      const sessions = [];
      for (const key of keys) {
        const data = await this.redis.getJson<any>(key);
        if (data && data.createdAt) {
          sessions.push({ key, createdAt: new Date(data.createdAt).getTime() });
        }
      }
      // Sort by oldest first
      sessions.sort((a, b) => a.createdAt - b.createdAt);
      
      const toRemove = sessions.length - limit;
      for (let i = 0; i < toRemove; i++) {
        const keyToRemove = sessions[i].key;
        const oldToken = keyToRemove.split(':').pop();
        await this.redis.del(keyToRemove);
        await this.redis.del(`${REFRESH_PREFIX}${oldToken}`);
      }
    }

    return {
      accessToken,
      refreshToken,
      role: params.role,
      redirectPath: getDashboardPathForRole(params.role),
    };
  }
}
