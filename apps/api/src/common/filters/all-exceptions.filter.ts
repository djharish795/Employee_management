import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      const responseData = exception.getResponse() as any;
      message = responseData.message || exception.message;
      errorCode = responseData.error || exception.name;
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
      
      // Security & UX: Do not expose raw database errors or internal stack traces to the frontend
      if (exception.message.includes('Can\'t reach database server')) {
        message = 'Unable to connect to the database. Please ensure your VPN is connected.';
      } else {
        message = 'An unexpected internal server error occurred.';
      }
    } else {
      this.logger.error('Unhandled exception', exception);
    }

    const errorResponse = {
      success: false,
      message: Array.isArray(message) ? message.join(', ') : message,
      errorCode,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}
