import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorPayload {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | object;
}

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalHttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = isHttp
      ? exception.getResponse()
      : (exception as Error)?.message ?? 'Error interno del servidor';

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status}`,
        (exception as Error)?.stack,
      );
    }

    const payload: ErrorPayload = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
    };

    response.status(status).json(payload);
  }
}
