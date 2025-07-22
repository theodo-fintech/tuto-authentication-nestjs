import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { Public } from '../decorators/public.decorator';
import { OAuthService } from './oauth.service';
import { OAuthProviderName } from './types/oauth-provider-config.type';
import { AccessToken } from '../types/AccessToken';

@Controller('oauth')
export class OAuthController {
  constructor(private oauthService: OAuthService) {}

  @Public()
  @Get(':provider')
  async authorize(
    @Param('provider') providerName: OAuthProviderName,
  ): Promise<string> {
    return await this.oauthService.getAuthorizationUrl(providerName);
  }

  @Public()
  @Get(':provider/callback')
  async callback(
    @Param('provider') providerName: OAuthProviderName,
    @Query('code') code: string,
    @Query('error') error: string,
    @Res() response: Response,
  ): Promise<AccessToken | Response> {
    if (error) {
      return response.status(400).json({ error: 'OAuth authorization failed' });
    }

    if (!code) {
      return response.status(400).json({ error: 'Authorization code missing' });
    }
    return await this.oauthService.handleOAuthCallback(providerName, code);
  }
}
