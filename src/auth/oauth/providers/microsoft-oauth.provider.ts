import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuthProviderInterface } from '../interfaces/oauth-provider.interface';
import { OAuthUser } from '../types/oauth-user.type';
import { MicrosoftOAuthConfig } from '../types/microsoft-oauth-config.type';

@Injectable()
export class MicrosoftOAuthProvider implements OAuthProviderInterface {
  private config: MicrosoftOAuthConfig;

  constructor(private configService: ConfigService) {
    this.config = {
      clientId: this.configService.get<string>('MICROSOFT_CLIENT_ID'),
      clientSecret: this.configService.get<string>('MICROSOFT_CLIENT_SECRET'),
      callbackURL: this.configService.get<string>('MICROSOFT_CALLBACK_URL'),
      scope: this.configService.get<string>('MICROSOFT_SCOPE')!.split(' '),
      authURL: this.configService.get<string>('MICROSOFT_AUTH_URL'),
      tokenURL: this.configService.get<string>('MICROSOFT_TOKEN_URL'),
      userInfoURL: this.configService.get<string>('MICROSOFT_USER_INFO_URL'),
    };
  }

  authorize(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: this.config.callbackURL,
      scope: this.config.scope.join(' '),
      response_mode: 'query',
    });

    return `${this.config.authURL}?${params.toString()}`;
  }

  async callback(code: string): Promise<OAuthUser> {
    const tokenResponse = await this.exchangeCodeForToken(code);
    const userInfo = await this.getUserInfo(tokenResponse.access_token);

    return {
      id: userInfo.id,
      email: userInfo.mail || userInfo.userPrincipalName,
      firstName: userInfo.givenName || '',
      lastName: userInfo.surname || '',
      picture: null, // Microsoft Graph API doesn't provide profile picture in basic user info
      emailVerified: true, // Microsoft emails are generally verified
    };
  }

  getProviderName(): string {
    return 'microsoft';
  }

  private async exchangeCodeForToken(code: string): Promise<any> {
    const response = await fetch(this.config.tokenURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        redirect_uri: this.config.callbackURL,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    return response.json();
  }

  private async getUserInfo(accessToken: string): Promise<any> {
    const response = await fetch(this.config.userInfoURL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    return response.json();
  }
}
