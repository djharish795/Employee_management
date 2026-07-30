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
}
