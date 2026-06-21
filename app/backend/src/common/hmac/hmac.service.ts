import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';

@Injectable()
export class HmacService {
  private readonly secret: string | undefined;

  constructor(private readonly config: ConfigService) {
    this.secret = this.config.get<string>('WEBHOOK_SECRET');
  }

  private getSecret(): string {
    if (!this.secret) {
      throw new Error('WEBHOOK_SECRET is not configured');
    }
    return this.secret;
  }

  /**
   * Signs a payload string and returns the hex HMAC-SHA256 digest.
   * Use this when sending outbound callbacks so the receiver can verify.
   */
  sign(payload: string): string {
    return createHmac('sha256', this.getSecret()).update(payload).digest('hex');
  }

  /**
   * Timing-safe comparison of a received signature against the expected one.
   */
  verify(payload: string, signature: string): boolean {
    const expected = this.sign(payload);
    try {
      return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
      return false;
    }
  }
}
