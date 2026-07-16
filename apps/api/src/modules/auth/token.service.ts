import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UserRole, getDashboardPathForRole } from "@naprocs/types";
import { v4 as uuidv4 } from "uuid";
import { RedisService } from "../../redis/redis.service";

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
  ) {}

  async issueTokens(params: {
    userId: string;
    email: string;
    role: UserRole;
    employeeId?: string;
  }): Promise<AuthTokens> {
    const payload = {
      sub: params.userId,
      email: params.email,
      role: params.role,
      employeeId: params.employeeId,
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
      { createdAt: new Date().toISOString() },
      refreshTtlSeconds,
    );

    return {
      accessToken,
      refreshToken,
      role: params.role,
      redirectPath: getDashboardPathForRole(params.role),
    };
  }
}
