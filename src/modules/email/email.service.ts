// src/mail/mail.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async send2FACode(email: string, code: string) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: [email],
        subject: `${code} es tu código de acceso a ASESCON`,
        // Aquí es donde integrarías el HTML de React Email más adelante
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #0f172a;">
            <h2 style="color: #0284c7;">Verificación de Identidad</h2>
            <p>Has intentado acceder al panel administrativo de <strong>ASESCON</strong>.</p>
            <div style="background: #f1f5f9; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a;">${code}</span>
            </div>
            <p style="font-size: 12px; color: #64748b;">Este código expirará en 5 minutos. Si no solicitaste este acceso, cambia tu contraseña inmediatamente.</p>
          </div>
        `,
      });

      if (error) {
        throw new InternalServerErrorException(error.message);
      }
      return data;
    } catch (err) {
      throw new InternalServerErrorException(
        'Error al enviar el correo de seguridad: ' +
          (err instanceof Error ? err.message : 'Unknown error'),
      );
    }
  }
}
