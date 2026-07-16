import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../../prisma/prisma.service";
import { MfaService } from "./mfa.service";
import { TokenService } from "./token.service";
import { UserRole } from "@naprocs/types";
import { LoginDto } from "./dto/login.dto";
import { MfaVerifyDto } from "./dto/mfa-verify.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mfa: MfaService,
    private readonly tokens: TokenService,
  ) {}

  async login(dto: LoginDto) {
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

    // --- MFA TEMPORARILY BYPASSED FOR TESTING ---
    // const challenge = await this.mfa.createEmailOtpChallenge(user.id, user.email);
    //
    // return {
    //   mfaRequired: true,
    //   challengeId: challenge.challengeId,
    //   method: challenge.method,
    // };

    const issued = await this.tokens.issueTokens({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      employeeId: user.employeeId ?? undefined,
    });

    return {
      mfaRequired: false,
      token: issued.accessToken,
      refreshToken: issued.refreshToken,
      role: issued.role,
      redirectPath: issued.redirectPath,
    };
    // ---------------------------------------------
  }

  async verifyMfa(dto: MfaVerifyDto) {
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

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const issued = await this.tokens.issueTokens({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      employeeId: user.employeeId ?? undefined,
    });

    return {
      success: true,
      token: issued.accessToken,
      refreshToken: issued.refreshToken,
      role: issued.role,
      redirectPath: issued.redirectPath,
      unknownDevice: false,
    };
  }

  async trustDevice(challengeId: string) {
    // Device trust is persisted in a later iteration; acknowledge for UI flow.
    void challengeId;
    return { success: true };
  }
}
