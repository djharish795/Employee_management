import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: any;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((res) => {
        // If it's already an HTTP response object or stream, just return it
        if (res && res.pipe && typeof res.pipe === 'function') {
          return res;
        }

        // If the service already returned our standardized format, don't wrap it again
        if (res && res.success !== undefined && (res.data !== undefined || res.message !== undefined)) {
          return res;
        }

        let message = 'Operation successful';
        let data = res;
        let pagination = undefined;

        // Extract pagination if present (e.g. from PaginatedResult)
        if (res && res.data && res.meta) {
          data = res.data;
          pagination = res.meta;
        } else if (res && res.items && res.total !== undefined) {
          data = res.items;
          pagination = { total: res.total, page: res.page, limit: res.limit };
        }

        return {
          success: true,
          message,
          data,
          ...(pagination && { pagination }),
        };
      }),
    );
  }
}
