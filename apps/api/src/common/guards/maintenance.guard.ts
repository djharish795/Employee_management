import { Injectable, CanActivate, ExecutionContext, ServiceUnavailableException } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { Request } from 'express';

const MAINTENANCE_MODE_KEY = 'EMS_MAINTENANCE_MODE';

@Injectable()
export class MaintenanceGuard implements CanActivate {
  constructor(private readonly redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const client = this.redis.getClient();

    // IP Firewall Check
    const ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress;
    const clientIp = typeof ip === 'string' ? ip.split(',')[0].trim() : (Array.isArray(ip) ? ip[0] : 'unknown');
    
    const isBanned = await client.sismember('EMS_BANNED_IPS', clientIp);
    if (isBanned === 1) {
      throw new ServiceUnavailableException('Access Denied: Your IP address has been permanently blocked by the Master Administrator.');
    }

    // Always allow Master Admin Observatory endpoints to bypass maintenance mode
    if (request.url.startsWith('/api/v1/master-admin') || request.url.startsWith('/api/v1/telemetry')) {
      return true;
    }

    // Check Redis for the global maintenance flag
    const isMaintenance = await client.get(MAINTENANCE_MODE_KEY);

    if (isMaintenance === 'true') {
      throw new ServiceUnavailableException('The system is currently undergoing emergency maintenance. Please try again later.');
    }

    return true;
  }
}
