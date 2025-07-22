import { Module } from '@nestjs/common';
import { OAuthService } from './oauth.service';
import { AuthModule } from '../auth.module';

@Module({
  imports: [AuthModule],
  providers: [OAuthService],
  exports: [OAuthService],
})
export class OAuthModule {}
