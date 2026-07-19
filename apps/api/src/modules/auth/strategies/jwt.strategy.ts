import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { ConfigService } from "@nestjs/config";
import { UserRole } from "@naprocs/types";
import { RedisService } from "../../../redis/redis.service";

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  employeeId?: string;
  jti: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly redis: RedisService,
  ) {
    const secret = configService.get<string>("JWT_SECRET");
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in the environment variables");
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let token = null;
          if (request && request.cookies) {
            token = request.cookies['token'];
          }
          return token || ExtractJwt.fromAuthHeaderAsBearerToken()(request);
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub || !payload.role || !payload.jti) {
      throw new UnauthorizedException("Invalid token payload");
    }

    const isRevoked = await this.redis.getJson<boolean>(`auth:revoked:${payload.jti}`);

    if (isRevoked) {
      throw new UnauthorizedException("Session has been revoked");
    }
    
    // Passport automatically attaches this return value to req.user
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      employeeId: payload.employeeId,
      jti: payload.jti,
    };
  }
}
