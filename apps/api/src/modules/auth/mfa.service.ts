import { Injectable, Logger } from "@nestjs/common";
import { randomInt } from "crypto";
import { v4 as uuidv4 } from "uuid";
import { RedisService } from "../../redis/redis.service";
import { EmailService } from "../notifications/email.service";

const CHALLENGE_TTL_SECONDS = 300;
const CHALLENGE_PREFIX = "mfa:challenge:";

export interface MfaChallenge {
  userId: string;
  email: string;
  otp: string;
  method: "EMAIL_OTP";
  createdAt: string;
  attempts: number;
}

@Injectable()
export class MfaService {
  private readonly logger = new Logger(MfaService.name);

  constructor(
    private readonly redis: RedisService,
    private readonly emailService: EmailService
  ) {}

  private generateOtp(): string {
    return randomInt(100000, 999999).toString();
  }

  async createEmailOtpChallenge(userId: string, email: string): Promise<{ challengeId: string; method: "EMAIL_OTP" }> {
    const challengeId = uuidv4();
    const otp = this.generateOtp();

    const challenge: MfaChallenge = {
      userId,
      email,
      otp,
      method: "EMAIL_OTP",
      createdAt: new Date().toISOString(),
      attempts: 0,
    };

    await this.redis.setJson(`${CHALLENGE_PREFIX}${challengeId}`, challenge, CHALLENGE_TTL_SECONDS);

    // Send the OTP via email
    await this.emailService.sendEmail(
      email,
      "Your Naprocs Verification Code",
      "mfa_otp",
      { otp, expiresInMinutes: 5 }
    );

    return { challengeId, method: "EMAIL_OTP" };
  }

  async verifyChallenge(challengeId: string, code: string): Promise<MfaChallenge | null> {
    const key = `${CHALLENGE_PREFIX}${challengeId}`;
    const challenge = await this.redis.getJson<MfaChallenge>(key);
    if (!challenge) return null;
    
    if (challenge.otp !== code) {
      challenge.attempts = (challenge.attempts || 0) + 1;
      if (challenge.attempts >= 3) {
        this.logger.warn(`Burning MFA challenge ${challengeId} after 3 failed attempts`);
        await this.redis.del(key);
      } else {
        const redisClient = this.redis.getClient();
        const ttl = await redisClient.ttl(key);
        if (ttl > 0) {
          await this.redis.setJson(key, challenge, ttl);
        }
      }
      return null;
    }

    await this.redis.del(key);
    return challenge;
  }
}
