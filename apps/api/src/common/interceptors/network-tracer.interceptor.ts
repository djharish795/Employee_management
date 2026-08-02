import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RedisService } from '../../redis/redis.service';

export interface NetworkTrace {
  id: string;
  method: string;
  url: string;
  ip: string;
  timestamp: number;
  latencyMs: number;
  statusCode: number;
  requestSize: number;
  responseSize: number;
  payload: any;
}

@Injectable()
export class NetworkTracerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(NetworkTracerInterceptor.name);

  constructor(private readonly redis: RedisService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    
    // Ignore internal metrics or health endpoints if needed
    if (req.url.includes('/api/v1/telemetry') || req.url.includes('/api/v1/system/health')) {
      return next.handle();
    }

    const startTime = Date.now();
    const method = req.method;
    const url = req.url;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    
    // Calculate approximate request size safely without stringifying
    const requestSize = req.headers['content-length'] ? parseInt(req.headers['content-length'], 10) : 0;

    // Mask sensitive payload data (Safety check to prevent event loop stalls on huge payloads)
    let maskedPayload: any = '[PAYLOAD_TOO_LARGE_TO_TRACE]';
    if (requestSize < 50000) {
      maskedPayload = this.maskPayload(req.body);
    }

    return next.handle().pipe(
      tap({
        next: (data: any) => {
          this.logTrace(res, startTime, method, url, ip, requestSize, data, maskedPayload);
        },
        error: (err: any) => {
          this.logTrace(res, startTime, method, url, ip, requestSize, { error: err.message }, maskedPayload, err.status || 500);
        }
      })
    );
  }

  private logTrace(res: any, startTime: number, method: string, url: string, ip: string, requestSize: number, responseData: any, payload: any, forcedStatus?: number) {
    const latencyMs = Date.now() - startTime;
    const statusCode = forcedStatus || res.statusCode;
    
    // Calculate approximate response size safely without stringifying
    const responseSize = res.getHeader('content-length') 
      ? parseInt(res.getHeader('content-length') as string, 10) 
      : 0;

    const trace: NetworkTrace = {
      id: Math.random().toString(36).substring(2, 10),
      method,
      url,
      ip: typeof ip === 'string' ? ip.split(',')[0].trim() : ip,
      timestamp: Date.now(),
      latencyMs,
      statusCode,
      requestSize,
      responseSize,
      payload
    };

    // Publish to Redis for Master Admin live terminal
    try {
      this.redis.getClient().publish('API_NETWORK_TRACES', JSON.stringify(trace));
    } catch (e) {
      this.logger.warn('Failed to publish network trace to Redis');
    }
  }

  private maskPayload(body: any): any {
    if (!body || typeof body !== 'object') return body;
    
    const masked = { ...body };
    const sensitiveKeys = ['password', 'token', 'secret', 'mfa', 'otp', 'aadhaar', 'pan'];
    
    for (const key of Object.keys(masked)) {
      if (typeof masked[key] === 'object' && masked[key] !== null) {
        masked[key] = this.maskPayload(masked[key]);
      } else if (typeof masked[key] === 'string') {
        if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
          masked[key] = '[REDACTED_BY_GOD_MODE]';
        }
      }
    }
    return masked;
  }
}
