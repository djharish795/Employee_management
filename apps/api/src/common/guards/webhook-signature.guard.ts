import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { Request } from 'express';

@Injectable()
export class WebhookSignatureGuard implements CanActivate {
  private readonly logger = new Logger(WebhookSignatureGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const signature = request.headers['x-webhook-signature'];

    if (!signature || typeof signature !== 'string') {
      this.logger.warn('Missing or invalid webhook signature header');
      throw new UnauthorizedException('Missing webhook signature');
    }

    const secret = process.env.WEBHOOK_SECRET || 'default-secret-do-not-use-in-prod';
    const payload = JSON.stringify(request.body);

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    if (signature !== expectedSignature) {
      this.logger.error('Invalid webhook signature detected');
      throw new UnauthorizedException('Invalid webhook signature');
    }

    return true;
  }
}
