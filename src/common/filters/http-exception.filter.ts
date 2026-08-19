import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';

import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();

    response.status(status).json({
      success: false,
      statusCode: status,
      path: request.url,
      timeStamp: new Date().toISOString(),
      error: exceptionResponse,
    });
  }
}

// Example:
// Al hacer
// throw new NotFoundException('User not found');
// Se obtendra un reporte mas consistente
// {
//   "success": false,
//   "statusCode": 404,
//   "path": "/users/123",
//   "timestamp": "2026-06-24T18:00:00.000Z",
//   "error": {
//     "message": "User not found",
//     "error": "Not Found",
//     "statusCode": 404
//   }
// }
