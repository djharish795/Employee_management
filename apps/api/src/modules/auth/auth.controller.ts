import { Body, Controller, Post, UseGuards, Res, Req, UnauthorizedException, Get } from "@nestjs/common";
import { Response, Request } from "express";
import { ThrottlerGuard } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { MfaVerifyDto } from "./dto/mfa-verify.dto";
import { TrustDeviceDto } from "./dto/trust-device.dto";
import { RefreshAuthDto } from "./dto/refresh.dto";

@Controller("auth")
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    if (result.token) {
      res.cookie("token", result.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: "strict", maxAge: 86400000 });
    }
    if (result.refreshToken) {
      res.cookie("refreshToken", result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: "strict", maxAge: 86400000 * 7 });
    }
    return result;
  }

  @Post("mfa")
  async verifyMfa(@Body() dto: MfaVerifyDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.verifyMfa(dto);
    if (result.token) {
      res.cookie("token", result.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: "strict", maxAge: 86400000 });
    }
    if (result.refreshToken) {
      res.cookie("refreshToken", result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: "strict", maxAge: 86400000 * 7 });
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
      res.cookie("token", result.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: "strict", maxAge: 86400000 });
    }
    if (result.refreshToken) {
      res.cookie("refreshToken", result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: "strict", maxAge: 86400000 * 7 });
    }
    return result;
  }

  @Post("logout")
  async logout(@Res({ passthrough: true }) res: Response) {
    res.cookie("token", "", { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: "strict", maxAge: 0 });
    res.cookie("refreshToken", "", { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: "strict", maxAge: 0 });
    return { success: true };
  }
}
