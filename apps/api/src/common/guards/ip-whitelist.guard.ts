import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Request } from 'express';

function ipv4ToLong(ip: string): number | null {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) {
    return null;
  }
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

// Supports plain IPv4 addresses and IPv4 CIDR ranges (e.g. "10.20.0.0/16").
// IPv6 entries are matched as exact strings only.
function ipMatchesRange(ip: string, range: string): boolean {
  const cleanIp = ip.replace(/^::ffff:/, '');

  if (!range.includes('/')) {
    return cleanIp === range.replace(/^::ffff:/, '');
  }

  const [network, bitsStr] = range.split('/');
  const bits = Number(bitsStr);
  const ipLong = ipv4ToLong(cleanIp);
  const networkLong = ipv4ToLong(network);
  if (ipLong === null || networkLong === null || Number.isNaN(bits) || bits < 0 || bits > 32) {
    return false;
  }
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return (ipLong & mask) === (networkLong & mask);
}

@Injectable()
export class IpWhitelistGuard implements CanActivate {
  private readonly logger = new Logger('SECURITY_IP_FIREWALL');

  // Loopback is always allowed (in-container health checks, local tooling).
  private readonly alwaysAllowed = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];

  canActivate(context: ExecutionContext): boolean {
    // Dev/staging rely on VPN-only network access (AWS Client VPN + private subnets)
    // rather than this app-layer check, matching AGENTS.md's network security model.
    if (process.env.NODE_ENV !== 'production') {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const clientIp = request.ip;

    if (clientIp && this.alwaysAllowed.includes(clientIp)) {
      return true;
    }

    const configuredRanges = (process.env.ALLOWED_IP_RANGES || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (configuredRanges.length === 0) {
      // Fail closed: an unconfigured allow-list in production must not silently open the gate.
      this.logger.error('ALLOWED_IP_RANGES is not set in production — denying all traffic until it is configured with the office/VPN CIDR ranges.');
      throw new ForbiddenException('Access denied. IP allow-list is not configured.');
    }

    const allowed = !!clientIp && configuredRanges.some((range) => ipMatchesRange(clientIp, range));

    if (!allowed) {
      this.logger.warn(`❌ [IP FIREWALL BLOCK] Unauthorized access attempt from IP: ${clientIp}`);
      throw new ForbiddenException('Access denied. IP not whitelisted in corporate subnet.');
    }

    return true;
  }
}
