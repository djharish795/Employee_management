import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

@Injectable()
export class PayloadDecryptionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Only process POST, PUT, PATCH requests with a body
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body && req.body.payload && Object.keys(req.body).length === 1) {
      const secret = process.env.API_PAYLOAD_ENCRYPTION_KEY;
      if (!secret) {
        // If encryption isn't configured but a payload was sent, reject.
        throw new BadRequestException("API Payload Encryption is not configured on the server.");
      }

      try {
        const encryptedData = req.body.payload;
        const parts = encryptedData.split(':');
        
        if (parts.length !== 2) {
          throw new Error("Invalid payload format");
        }

        const iv = Buffer.from(parts[0], 'base64');
        const encryptedText = parts[1];
        
        const keyBuffer = crypto.createHash('sha256').update(secret).digest();
        const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
        
        let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
        decrypted += decipher.final('utf8');

        // Overwrite req.body with the parsed JSON
        req.body = JSON.parse(decrypted);
        
      } catch (err) {
        console.error("Payload Decryption Failed:", err);
        throw new BadRequestException("Invalid or corrupted encrypted payload.");
      }
    }
    next();
  }
}
