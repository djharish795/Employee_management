import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { EmailService } from '../notifications/email.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const LOCKOUT_KEY = 'master_admin:lockout';
const OTP_KEY_PREFIX = 'master_admin:otp:';
const MAX_ATTEMPTS = 3;
const LOCKOUT_SECONDS = 900; // 15 minutes
const OTP_TTL_SECONDS = 300; // 5 minutes

@Injectable()
export class MasterAdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async requestOtp(pin: string, ipAddress: string): Promise<{ success: boolean; message: string }> {
    const client = this.redis.getClient();

    const lockout = await client.get(LOCKOUT_KEY);
    if (lockout) throw new UnauthorizedException('Too many failed attempts. Try again in 15 minutes.');

    const storedPinHash = process.env.MASTER_ADMIN_PIN_HASH;
    if (!storedPinHash) throw new UnauthorizedException('Master admin is not configured.');

    const isValid = await bcrypt.compare(pin, storedPinHash);
    if (!isValid) {
      const attempts = await client.incr('master_admin:attempts');
      await client.expire('master_admin:attempts', LOCKOUT_SECONDS);
      
      if (attempts >= MAX_ATTEMPTS) {
        await client.set(LOCKOUT_KEY, '1', 'EX', LOCKOUT_SECONDS);
        await client.del('master_admin:attempts');
        throw new UnauthorizedException('Too many failed attempts. Account locked for 15 minutes.');
      }
      throw new UnauthorizedException(`Invalid PIN. ${MAX_ATTEMPTS - attempts} attempts remaining.`);
    }

    await client.del('master_admin:attempts');

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    await client.set(`${OTP_KEY_PREFIX}pending`, otpHash, 'EX', OTP_TTL_SECONDS);

    const adminEmail = process.env.MASTER_ADMIN_EMAIL;
    if (!adminEmail) throw new UnauthorizedException('Master admin email not configured.');

    await this.emailService.sendEmail(
      adminEmail,
      'Master Admin Access OTP',
      'mfa_otp',
      { otp, expiresInMinutes: 5, ipAddress },
    );

    return { success: true, message: 'OTP sent to your registered email.' };
  }

  async verifyOtp(otp: string): Promise<{ token: string }> {
    const client = this.redis.getClient();

    const lockout = await client.get(LOCKOUT_KEY);
    if (lockout) throw new UnauthorizedException('Too many failed attempts. Try again in 15 minutes.');

    const storedHash = await client.get(`${OTP_KEY_PREFIX}pending`);
    if (!storedHash) throw new UnauthorizedException('OTP expired or not requested. Please start over.');

    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    if (otpHash !== storedHash) {
      const attempts = await client.incr('master_admin:otp_attempts');
      await client.expire('master_admin:otp_attempts', LOCKOUT_SECONDS);
      
      if (attempts >= MAX_ATTEMPTS) {
        await client.set(LOCKOUT_KEY, '1', 'EX', LOCKOUT_SECONDS);
        await client.del('master_admin:otp_attempts');
        await client.del(`${OTP_KEY_PREFIX}pending`);
        throw new UnauthorizedException('Too many failed OTP attempts. Account locked for 15 minutes.');
      }
      throw new UnauthorizedException(`Invalid OTP. ${MAX_ATTEMPTS - attempts} attempts remaining.`);
    }

    await client.del(`${OTP_KEY_PREFIX}pending`);
    await client.del('master_admin:otp_attempts');

    const secret = process.env.MASTER_ADMIN_JWT_SECRET;
    if (!secret) throw new UnauthorizedException('MASTER_ADMIN_JWT_SECRET not configured.');

    const token = this.jwtService.sign(
      { type: 'MASTER_ADMIN', iat: Date.now() },
      { secret, expiresIn: '4h' },
    );

    return { token };
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      const secret = process.env.MASTER_ADMIN_JWT_SECRET;
      if (!secret) return false;
      const payload = this.jwtService.verify(token, { secret });
      return payload.type === 'MASTER_ADMIN';
    } catch {
      return false;
    }
  }
}
