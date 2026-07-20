import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class PiiMaskingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user;
    
    // CEO bypasses masking
    const isCeo = user?.role === 'CEO';

    return next.handle().pipe(
      map(data => {
        if (isCeo || !data) return data;
        return this.maskData(data);
      }),
    );
  }

  private maskData(data: any): any {
    if (Array.isArray(data)) {
      return data.map(item => this.maskData(item));
    }
    
    if (data !== null && typeof data === 'object') {
      const maskedObj: any = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          if (['aadhaar', 'pan', 'bankAccountEnc'].includes(key) && typeof data[key] === 'string') {
            maskedObj[key] = this.maskString(data[key]);
          } else {
            maskedObj[key] = this.maskData(data[key]);
          }
        }
      }
      return maskedObj;
    }
    
    return data;
  }

  private maskString(val: string): string {
    if (val.length <= 4) return 'XXXX';
    const visible = val.slice(-4);
    return 'X'.repeat(val.length - 4) + visible;
  }
}
