import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import {
  EventAccessDeniedError,
  EventValidationUnavailableError,
} from '../../application/errors/checkin.errors';

type CheckinError = EventAccessDeniedError | EventValidationUnavailableError;

@Catch(EventAccessDeniedError, EventValidationUnavailableError)
export class CheckinExceptionFilter implements ExceptionFilter<CheckinError> {
  catch(exception: CheckinError, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const forbidden = exception instanceof EventAccessDeniedError;
    response
      .status(forbidden ? HttpStatus.FORBIDDEN : HttpStatus.SERVICE_UNAVAILABLE)
      .json({
        statusCode: forbidden
          ? HttpStatus.FORBIDDEN
          : HttpStatus.SERVICE_UNAVAILABLE,
        code: forbidden ? 'EVENT_FORBIDDEN' : 'VALIDATION_UNAVAILABLE',
        message: exception.message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
  }
}
