<<<<<<< HEAD
=======
// src/auth/auth.module.ts

>>>>>>> 7f7490cce78565740eef7ab277405d490b2cfc5f
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategies';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    EmailModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'clave-secreta-asescon-2026',
      signOptions: { expiresIn: '8h' }, // Sesión de 8 horas para la intranet
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
