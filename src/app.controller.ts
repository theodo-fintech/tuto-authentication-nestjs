import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { User } from './auth/decorators/user.decorator';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(@User() user): Promise<string> {
    return await this.appService.getHello(user.id);
  }

  @Public()
  @Get('health')
  healthCheck(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
