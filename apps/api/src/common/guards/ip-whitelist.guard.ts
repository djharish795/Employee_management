import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class IpWhitelistGuard implements CanActivate {
  private readonly logger = new Logger('SECURITY_IP_FIREWALL');
  
  // Hardcoded list of allowed corporate / VPN IPs (and localhost for dev)
  private readonly allowedIps = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const clientIp = request.ip;

    if (!clientIp || !this.allowedIps.includes(clientIp)) {
      this.logger.warn(`❌ [IP FIREWALL BLOCK] Unauthorized access attempt from IP: ${clientIp}`);
      throw new ForbiddenException('Access denied. IP not whitelisted in corporate subnet.');
    }

    return true;
  }
}
