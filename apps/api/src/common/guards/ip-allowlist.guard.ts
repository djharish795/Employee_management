import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IpAllowlistGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const clientIp = request.ip || request.connection?.remoteAddress || '127.0.0.1';

    const allowedIpsStr = this.configService.get<string>('ALLOWED_IPS');
    if (!allowedIpsStr) {
      return true; // Pass if no allowlist is configured
    }

    const allowedIps = allowedIpsStr.split(',').map(ip => ip.trim());
    
    if (allowedIps.includes(clientIp) || allowedIps.includes('*')) {
      return true;
    }

    throw new ForbiddenException(`Access denied from IP address: ${clientIp}`);
  }
}
