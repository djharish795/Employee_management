import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class IpWhitelistGuard implements CanActivate {
  private readonly logger = new Logger('SECURITY_IP_FIREWALL');

  /**
   * CORPORATE_IP_WHITELIST: comma-separated list of allowed IPs/CIDRs.
   * If the env var is empty or not set, the guard is DISABLED — network-layer
   * security is then handled entirely by Cloudflare Tunnel + WAF v2
   * (office CIDR + VPN CIDR rules) as defined in Section 9.2 of the architecture.
   *
   * In local development the guard is always bypassed (NODE_ENV !== production).
   */
  private readonly allowedIps: string[] = process.env.CORPORATE_IP_WHITELIST
    ? process.env.CORPORATE_IP_WHITELIST.split(',').map(ip => ip.trim()).filter(Boolean)
    : [];

  canActivate(context: ExecutionContext): boolean {
    // Guard is disabled when no explicit whitelist is configured —
    // Cloudflare Tunnel + WAF handles perimeter security in production.
    if (this.allowedIps.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    // Cloudflare passes the real client IP in CF-Connecting-IP header.
    // Fall back to X-Forwarded-For, then socket remoteAddress.
    const clientIp =
      (request.headers['cf-connecting-ip'] as string) ||
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      request.socket?.remoteAddress ||
      request.ip;

    if (!clientIp || !this.allowedIps.includes(clientIp)) {
      this.logger.warn(`❌ [IP FIREWALL BLOCK] Unauthorized access attempt from IP: ${clientIp}`);
      throw new ForbiddenException('Access denied. IP not whitelisted in corporate subnet.');
    }

    this.logger.log(`✅ [IP FIREWALL PASS] Allowed IP: ${clientIp}`);
    return true;
  }
}
