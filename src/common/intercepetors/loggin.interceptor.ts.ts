import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';

import { Observable, tap } from 'rxjs';

// Este interceptor medira los ms de cada request
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();

    const { method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - startTime;

        this.logger.log(`${method} ${url} - ${responseTime}ms`);
      }),
    );
  }
}

// Terminal:
// [Nest] 12345 LOG POST /api/auth/login - 83ms
