import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { Response } from 'express';

import { PrismaErrorMessage } from '../constants/prisma-errors';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter<Prisma.PrismaClientKnownRequestError> {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const error =
      PrismaErrorMessage[exception.code as keyof typeof PrismaErrorMessage];

    const response = ctx.getResponse<Response>();

    if (error) {
      throw new error.status(error.message);
    }

    return response.status(500).json({
      success: false,
      message: 'Internal server Error',
    });
  }
}

// Decorator que se va usar mucho.

// Como usarlo -->
// @Get('me')
// getMe(@CurrentUser('id')userId: string) {
//     return this.usersService.findById(user.id);
// }

// Tambien ->
// @CurrentUser('role')role: role

// o -> @CurrentUser('role')role: Role

// o -> @CurrentUser()user
