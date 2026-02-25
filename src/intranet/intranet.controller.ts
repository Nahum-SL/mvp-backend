import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IntranetService } from './intranet.service';

@Controller('intranet')
export class IntranetController {
  constructor(private readonly intranetService: IntranetService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('links')
  async getMyLinks(@Req() req: any) {
    // El usuario viene del Token gracias al JwtStrategy que hicimos
    const user = req.user;

    // Aquí puedes personalizar la respuesta según el rol
    const links = await this.intranetService.getLinksByRole(user.role);

    return {
      userName: user.name,
      role: user.role,
      links: links,
    };
  }
}
