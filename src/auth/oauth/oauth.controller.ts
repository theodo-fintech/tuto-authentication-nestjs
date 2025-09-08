import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { Public } from '../decorators/public.decorator';
import { OAuthService } from './oauth.service';
import { OAuthProviderName } from './types/oauth-provider-config.type';
import { AccessToken } from '../types/AccessToken';

@Public()
@Controller('oauth')
export class OAuthController {
  constructor(private oauthService: OAuthService) {}

  @Get(':provider')
  async authorize(@Param('provider') providerName: OAuthProviderName) {
    return {
      authorizationUrl:
        await this.oauthService.getAuthorizationUrl(providerName),
    };
  }

  @Get(':provider/callback')
  async callback(
    @Param('provider') providerName: OAuthProviderName,
    @Query('code') code: string,
    @Query('error') error: string,
  ): Promise<AccessToken> {
    if (error) {
      throw new BadRequestException('OAuth authorization failed');
    }

    if (!code) {
      throw new BadRequestException('Authorization code missing');
    }

    return await this.oauthService.handleOAuthCallback(providerName, code);
  }
}
