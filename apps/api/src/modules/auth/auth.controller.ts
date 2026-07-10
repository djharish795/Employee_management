import { Body, Controller, Post, UseGuards } from "@nestjs/common";
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
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post("mfa")
  verifyMfa(@Body() dto: MfaVerifyDto) {
    return this.authService.verifyMfa(dto);
  }

  @Post("device/trust")
  trustDevice(@Body() dto: TrustDeviceDto) {
    return this.authService.trustDevice(dto.challengeId);
  }

  @Post("refresh")
  refresh(@Body() dto: RefreshAuthDto) {
    return this.authService.refreshAuthToken(dto.refreshToken);
  }
}
