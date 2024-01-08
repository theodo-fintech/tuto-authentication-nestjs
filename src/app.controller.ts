import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { AccessTokenPayload } from './auth/types/AccessTokenPayload';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getHello(@Request() req): Promise<string> {
    const accessTokenPayload: AccessTokenPayload =
      req.user as AccessTokenPayload;
    return await this.appService.getHello(accessTokenPayload.userId);
  }
}
