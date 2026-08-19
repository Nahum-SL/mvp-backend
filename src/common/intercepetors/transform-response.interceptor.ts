import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';

import { map, Observable } from 'rxjs';

import { ApiResponse } from '../interfaces/api-response.interface';

// Estandariza todas las respuestas
@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> | Promise<Observable<ApiResponse<T>>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        message: 'Request successful',
        data,
      })),
    );
  }
}

// Funcion
// Antes
// {
//   "id": 1,
//   "email": "admin@asescon.com"
// }

// Despues
// {
//   "success": true,
//   "message": "Request successful",
//   "data": {
//     "id": 1,
//     "email": "admin@asescon.com"
//   }
// }

// ==========================================

// Más adelante podemos hacerlo más avanzado para permitir mensajes personalizados.
// {
//   "success": true,
//   "message": "User created successfully",
//   "data": {}
// }
