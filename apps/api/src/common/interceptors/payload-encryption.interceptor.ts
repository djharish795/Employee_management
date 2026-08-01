import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

@Injectable()
export class PayloadEncryptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        // Don't encrypt if there's no data or it's a buffer/stream (like file downloads)
        if (!data || Buffer.isBuffer(data) || data.stream) {
          return data;
        }

        // Only encrypt if a key is configured
        const secret = process.env.API_PAYLOAD_ENCRYPTION_KEY;
        if (!secret) {
          // If no key is configured, return raw data
          return data;
        }

        try {
          const jsonString = JSON.stringify(data);
          // Ensure key is exactly 32 bytes for AES-256
          const keyBuffer = crypto.createHash('sha256').update(secret).digest();

          const iv = crypto.randomBytes(16);
          const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
          let encrypted = cipher.update(jsonString, 'utf8', 'base64');
          encrypted += cipher.final('base64');
          
          return {
            payload: iv.toString('base64') + ':' + encrypted
          };
        } catch (err) {
          console.error("Payload Encryption Failed:", err);
          return data;
        }
      }),
    );
  }
}
