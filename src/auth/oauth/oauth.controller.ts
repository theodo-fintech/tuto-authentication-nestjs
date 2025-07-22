import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { Public } from '../decorators/public.decorator';
import { OAuthProviderFactory } from './providers/oauth-provider.factory';
import { OAuthService } from './oauth.service';
import { AuthService } from '../auth.service';
import { OAuthProviderName } from './types/oauth-provider-config.type';

@Controller('auth')
export class OAuthController {
  constructor(
    private oauthProviderFactory: OAuthProviderFactory,
    private oauthService: OAuthService,
    private authService: AuthService,
  ) {}

  @Public()
  @Get(':provider')
  async authorize(
    @Param('provider') providerName: string,
    @Res() res: Response,
  ) {
    try {
      const provider = this.oauthProviderFactory.getProvider(
        providerName as OAuthProviderName,
      );
      const authUrl = provider.authorize();
      return res.redirect(authUrl);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  @Public()
  @Get(':provider/callback')
  async callback(
    @Param('provider') providerName: string,
    @Query('code') code: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    if (error) {
      return res.status(400).json({ error: 'OAuth authorization failed' });
    }

    if (!code) {
      return res.status(400).json({ error: 'Authorization code missing' });
    }

    try {
      const provider = this.oauthProviderFactory.getProvider(
        providerName as OAuthProviderName,
      );
      const oauthUser = await provider.callback(code);
      const user = await this.oauthService.handleOAuthLogin(
        providerName as OAuthProviderName,
        oauthUser,
      );
      const tokens = await this.authService.login(user);

      return res.json({
        message: 'OAuth login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        ...tokens,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}
