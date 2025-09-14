import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { OAuthUser } from './types/oauth-user.type';
import { OAuthProviderName } from './types/oauth-provider-config.type';
import { OAuthProviderFactory } from './providers/oauth-provider.factory';
import { UsersService } from 'src/users/users.service';
import { AccessToken } from '../types/AccessToken';
import { AuthService } from '../auth.service';
import { OAuthAccountsService } from './oauth-accounts.service';

@Injectable()
export class OAuthService {
  constructor(
    private authService: AuthService,
    private oauthProviderFactory: OAuthProviderFactory,
    private oauthAccountsService: OAuthAccountsService,
    private usersService: UsersService,
  ) {}

  async getAuthorizationUrl(provider: OAuthProviderName): Promise<string> {
    return this.oauthProviderFactory.getProvider(provider).authorize();
  }

  async handleOAuthCallback(
    providerName: OAuthProviderName,
    code: string,
  ): Promise<AccessToken> {
    const provider = this.oauthProviderFactory.getProvider(providerName);
    const oauthUser = await provider.callback(code);
    const user = await this.handleOAuthLogin(providerName, oauthUser);
    return this.authService.login(user);
  }

  private async handleOAuthLogin(
    provider: OAuthProviderName,
    oauthUser: OAuthUser,
  ): Promise<User> {
    const oauthAccount = await this.oauthAccountsService.findOneByProvider(
      provider,
      oauthUser.id,
    );

    if (oauthAccount) {
      return oauthAccount.user;
    }

    let user = await this.usersService.findOneByEmail(oauthUser.email);

    if (!user) {
      user = await this.usersService.createFromOAuthUser(oauthUser);
    }

    await this.oauthAccountsService.create(provider, oauthUser, user);

    return user;
  }
}
