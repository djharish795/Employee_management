import { Injectable, Logger } from "@nestjs/common";
import { randomInt } from "crypto";
import { v4 as uuidv4 } from "uuid";
import { RedisService } from "../../redis/redis.service";

const CHALLENGE_TTL_SECONDS = 300;
const CHALLENGE_PREFIX = "mfa:challenge:";

export interface MfaChallenge {
  userId: string;
  email: string;
  otp: string;
  method: "EMAIL_OTP";
  createdAt: string;
}

@Injectable()
export class MfaService {
  private readonly logger = new Logger(MfaService.name);

  constructor(private readonly redis: RedisService) {}

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
    };

    await this.redis.setJson(`${CHALLENGE_PREFIX}${challengeId}`, challenge, CHALLENGE_TTL_SECONDS);

    // MVP: log OTP for staging/dev until SES is wired
    this.logger.log(`EMAIL OTP for ${email}: ${otp} (challenge ${challengeId})`);

    return { challengeId, method: "EMAIL_OTP" };
  }

  async verifyChallenge(challengeId: string, code: string): Promise<MfaChallenge | null> {
    const challenge = await this.redis.getJson<MfaChallenge>(`${CHALLENGE_PREFIX}${challengeId}`);
    if (!challenge) return null;
    if (challenge.otp !== code) return null;

    await this.redis.del(`${CHALLENGE_PREFIX}${challengeId}`);
    return challenge;
  }
}
