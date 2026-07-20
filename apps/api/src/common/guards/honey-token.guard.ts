import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class HoneyTokenGuard implements CanActivate {
  private readonly logger = new Logger('SECURITY_HONEY_TOKEN');

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    
    const email = request.body?.email || request.query?.email;
    const honeyEmail = 'sysadmin_super_secret@naprocs.in';
    const honeyId = 'HONEY_TOKEN_SYSADMIN_999999';

    const requestStr = JSON.stringify(request.body) + JSON.stringify(request.params) + JSON.stringify(request.query);

    if (
      email === honeyEmail || 
      requestStr.includes(honeyEmail) || 
      requestStr.includes(honeyId) ||
      request.params?.id === honeyId
    ) {
      this.logger.fatal(`🚨 [CRITICAL ALERT] HONEY TOKEN TRIPPED! 🚨 IP: ${request.ip}, User Agent: ${request.headers['user-agent']}, Route: ${request.url}`);
      throw new ForbiddenException('Intrusion detected. Security incident logged.');
    }

    return true;
  }
}
