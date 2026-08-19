import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';

import {
  Observable,
  TimeoutError,
  timeout,
  catchError,
  throwError,
} from 'rxjs';

// Si el modelo se queda procesando demasiado tiempo, no quieres dejar una conexión abierta indefinidamente.
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly timeoutMs = 10000;

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<unknown> {
    return next.handle().pipe(
      timeout(this.timeoutMs),
      catchError((error) => {
        if (error instanceof TimeoutError) {
          return throwError(
            () =>
              new RequestTimeoutException(
                `The request exceeded the time limit`,
              ),
          );
        }
        return throwError(() => error);
      }),
    );
  }
}

// {
//   "statusCode": 408,
//   "message": "The request exceeded the time limit",
//   "error": "Request Timeout"
// }
