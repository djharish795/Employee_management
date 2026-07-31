import { Injectable, ExecutionContext } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    // Skip throttling in development environment to facilitate local testing and avoid lockouts
    if (process.env.NODE_ENV === "development") {
      return true;
    }
    return super.shouldSkip(context);
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    // If the user is authenticated, rate limit by their unique User ID.
    // If they are not logged in (e.g., login endpoint), fallback to their IP address.
    // This perfectly prevents 100 authenticated employees sharing the same Cloudflare IP
    // from instantly exhausting the 100-request limit.
    return req.user?.id || req.ip;
  }
}
