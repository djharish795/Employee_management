import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Logger } from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { AuditService } from "../../modules/audit/audit.service";

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      tap(() => {
        try {
          const user = request.user;
          const body = request.body;
          const ip = request.ip;
          const userAgent = request.headers["user-agent"];
          const requestId = request.headers["x-request-id"] as string;
          
          const resource = request.route?.path || request.url;
          const resourceId = request.params?.id || "N/A";

          const maskedBody = this.maskPii(body);

          this.auditService.createLog({
            action: request.method,
            actorId: user?.employeeId,
            ipAddress: ip,
            userAgent: userAgent,
            requestId: requestId,
            resource: resource,
            resourceId: resourceId,
            newValue: maskedBody,
          });
        } catch (error: any) {
          this.logger.error(`AuditInterceptor error: ${error.message}`, error.stack);
        }
      }),
    );
  }

  private maskPii(obj: any): any {
    if (!obj || typeof obj !== "object") {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.maskPii(item));
    }

    const maskedObj = { ...obj };
    const piiKeys = ["aadhaar", "pan", "bankaccountenc", "password", "secret", "token"];

    for (const key of Object.keys(maskedObj)) {
      const lowerKey = key.toLowerCase();
      
      if (piiKeys.some(pii => lowerKey.includes(pii))) {
        maskedObj[key] = "***MASKED***";
      } else if (typeof maskedObj[key] === "object" && maskedObj[key] !== null) {
        maskedObj[key] = this.maskPii(maskedObj[key]);
      }
    }

    return maskedObj;
  }
}
