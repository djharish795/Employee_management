import { Body, Controller, Post, UseGuards, Res, Req, UnauthorizedException, Get, Param } from "@nestjs/common";
import { Response, Request, CookieOptions } from "express";
import { ThrottlerGuard, Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { MfaVerifyDto } from "./dto/mfa-verify.dto";
import { TrustDeviceDto } from "./dto/trust-device.dto";
import { RefreshAuthDto } from "./dto/refresh.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

const cookieOptions = (maxAge: number): CookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: "strict" as const,
  maxAge,
});

@Controller("auth")
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 300000 } })
  @Post("login")
  async login(@Req() req: Request, @Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const ip = req.ip;
    const userAgent = req.headers["user-agent"];
    const result = await this.authService.login(dto, ip, userAgent);
    if (result.token) {
      res.cookie("token", result.token, cookieOptions(86400000));
    }
    if (result.refreshToken) {
      res.cookie("refreshToken", result.refreshToken, cookieOptions(86400000 * 7));
    }
    return result;
  }

  @Throttle({ default: { limit: 5, ttl: 300000 } })
  @Post("mfa")
  async verifyMfa(@Req() req: Request, @Body() dto: MfaVerifyDto, @Res({ passthrough: true }) res: Response) {
    const ip = req.ip;
    const userAgent = req.headers["user-agent"];
    const result = await this.authService.verifyMfa(dto, ip, userAgent);
    if (result.token) {
      res.cookie("token", result.token, cookieOptions(86400000));
    }
    if (result.refreshToken) {
      res.cookie("refreshToken", result.refreshToken, cookieOptions(86400000 * 7));
    }
    return result;
  }

  @Post("device/trust")
  trustDevice(@Body() dto: TrustDeviceDto) {
    return this.authService.trustDevice(dto.challengeId);
  }

  @Post("refresh")
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token missing");
    }
    const result = await this.authService.refreshAuthToken(refreshToken);
    if (result.token) {
      res.cookie("token", result.token, cookieOptions(86400000));
    }
    if (result.refreshToken) {
      res.cookie("refreshToken", result.refreshToken, cookieOptions(86400000 * 7));
    }
    return result;
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: Request & { user?: any }, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    const token = req.cookies?.token;
    
    // We would extract JTI from token here or pass it if req.user is set
    const jti = req.user?.jti;
    const userId = req.user?.userId;

    if (userId) {
      await this.authService.logout(userId, jti, refreshToken);
    }
    
    res.cookie("token", "", { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: "strict", maxAge: 0 });
    res.cookie("refreshToken", "", { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: "strict", maxAge: 0 });
    return { success: true };
  }

  @Get("sessions")
  @UseGuards(JwtAuthGuard)
  async getSessions(@Req() req: Request & { user?: any }) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException();
    return this.authService.getActiveSessions(userId);
  }

  @Post("sessions/:jti/revoke")
  @UseGuards(JwtAuthGuard)
  async revokeSession(@Req() req: Request & { user?: any }, @Param('jti') jti: string) {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException();
    return this.authService.revokeSession(userId, jti);
  }
}
