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

    // B-06: Enforce concurrent sessions limit using atomic ZSET
    const limitStr = this.config.get<string>("SESSION_MAX_CONCURRENT");
    const limit = limitStr ? parseInt(limitStr, 10) : 3;
    
    const zsetKey = `auth:user_sessions:${params.userId}`;
    const redisClient = this.redis.getClient();
    
    await redisClient.zadd(zsetKey, Date.now(), refreshToken);
    await redisClient.expire(zsetKey, refreshTtlSeconds);
    
    const count = await redisClient.zcard(zsetKey);
    if (count > limit) {
      const toRemoveCount = count - limit;
      const oldestTokens = await redisClient.zrange(zsetKey, 0, toRemoveCount - 1);
      
      if (oldestTokens.length > 0) {
        await redisClient.zremrangebyrank(zsetKey, 0, toRemoveCount - 1);
        const keysToDelete = oldestTokens.flatMap(t => [
          `${REFRESH_PREFIX}${t}`,
          `${SESSION_PREFIX}${params.userId}:${t}`
        ]);
        if (keysToDelete.length > 0) {
          await redisClient.del(...keysToDelete);
        }
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
