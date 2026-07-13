import * as crypto from 'crypto';
import { InternalServerErrorException } from '@nestjs/common';

const ALGORITHM = 'aes-256-gcm';

// The key must be exactly 32 bytes for AES-256
// In a real environment, this should come from AWS Secrets Manager
const getEncryptionKey = (): Buffer => {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret) {
    throw new InternalServerErrorException('FATAL: ENCRYPTION_KEY environment variable is required for AES-256 encryption.');
  }
  // If the secret is exactly 32 chars, use it. If not, hash it to 32 bytes.
  if (Buffer.from(secret).length === 32) {
    return Buffer.from(secret);
  }
  return crypto.createHash('sha256').update(secret).digest();
};

export function encryptData(text: string): string {
  if (!text) return text;
  
  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Format: iv:encryptedData:authTag
  return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
}

export function decryptData(encryptedText: string): string {
  if (!encryptedText) return encryptedText;
  
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new InternalServerErrorException('Invalid encrypted text format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const authTag = Buffer.from(parts[2], 'hex');
    const key = getEncryptionKey();
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    // Return original string if decryption fails (e.g. legacy plain text)
    // In production, you might want to throw or log this.
    return encryptedText;
  }
}
