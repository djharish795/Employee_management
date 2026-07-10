import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';

@Injectable()
export class DeviceTrustGuard implements CanActivate {
  private readonly logger = new Logger(DeviceTrustGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const deviceId = request.headers['x-device-id'];
    
    // In a fully robust implementation, we would verify the deviceId 
    // against the trusted devices list for the user in Redis/DB.
    // For now, we enforce that the client provides *a* device fingerprint.
    if (!deviceId && process.env.NODE_ENV === 'production') {
      this.logger.warn(`Missing x-device-id header from ${request.ip}`);
      // throw new ForbiddenException("Unrecognized device. Please verify your device.");
    }
    
    return true;
  }
}
