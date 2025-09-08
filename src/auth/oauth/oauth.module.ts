import { Module } from '@nestjs/common';
import { OAuthService } from './oauth.service';
import { AuthModule } from '../auth.module';
import { OAuthAccountsService } from './oauth-accounts.service';
import { GitHubOAuthProvider } from './providers/github-oauth.provider';
import { GoogleOAuthProvider } from './providers/google-oauth.provider';
import { MicrosoftOAuthProvider } from './providers/microsoft-oauth.provider';
import { OAuthProviderFactory } from './providers/oauth-provider.factory';
import { UsersModule } from 'src/users/users.module';
import { OAuthController } from './oauth.controller';

@Module({
  imports: [AuthModule, UsersModule],
  providers: [
    OAuthService,
    OAuthAccountsService,
    GoogleOAuthProvider,
    GitHubOAuthProvider,
    MicrosoftOAuthProvider,
    OAuthProviderFactory,
  ],
  controllers: [OAuthController],
  exports: [OAuthService, OAuthAccountsService],
})
export class OAuthModule {}
