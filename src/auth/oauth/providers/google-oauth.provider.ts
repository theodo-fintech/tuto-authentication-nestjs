import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuthProviderInterface } from '../interfaces/oauth-provider.interface';
import { OAuthUser } from '../types/oauth-user.type';
import { GoogleOAuthConfig } from '../types/google-oauth-config.type';

@Injectable()
export class GoogleOAuthProvider implements OAuthProviderInterface {
  private config: GoogleOAuthConfig;

  constructor(private configService: ConfigService) {
    this.config = {
      clientId: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: this.configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: this.configService.get<string>('GOOGLE_SCOPE').split(' '),
      authURL: this.configService.get<string>('GOOGLE_AUTH_URL'),
      tokenURL: this.configService.get<string>('GOOGLE_TOKEN_URL'),
    };
  }

  authorize(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.callbackURL,
      scope: this.config.scope.join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
    });

    return `${this.config.authURL}?${params.toString()}`;
  }

  async callback(code: string): Promise<OAuthUser> {
    const tokenResponse = await this.exchangeCodeForToken(code);
    const userInfo = await this.getUserInfo(tokenResponse.access_token);

    return {
      id: userInfo.id,
      email: userInfo.email,
      firstName: userInfo.given_name || '',
      lastName: userInfo.family_name || '',
      picture: userInfo.picture,
      emailVerified: userInfo.verified_email,
    };
  }

  getProviderName(): string {
    return 'google';
  }

  private async exchangeCodeForToken(
    code: string,
  ): Promise<{ access_token: string }> {
    const response = await fetch(this.config.tokenURL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.config.callbackURL,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    return response.json();
  }

  private async getUserInfo(accessToken: string) {
    const userInfoURL = this.configService.get<string>('GOOGLE_USER_INFO_URL');
    const response = await fetch(userInfoURL, {
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
