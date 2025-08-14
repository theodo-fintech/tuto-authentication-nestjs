import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuthProviderInterface } from '../interfaces/oauth-provider.interface';
import { OAuthUser } from '../types/oauth-user.type';
import { GitHubOAuthConfig } from '../types/github-oauth-config.type';

@Injectable()
export class GitHubOAuthProvider implements OAuthProviderInterface {
  private config: GitHubOAuthConfig;

  constructor(private configService: ConfigService) {
    this.config = {
      clientId: this.configService.get<string>('GITHUB_CLIENT_ID'),
      clientSecret: this.configService.get<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: this.configService.get<string>('GITHUB_CALLBACK_URL'),
      scope: this.configService.get<string>('GITHUB_SCOPE')!.split(' '),
      authURL: this.configService.get<string>('GITHUB_AUTH_URL'),
      tokenURL: this.configService.get<string>('GITHUB_TOKEN_URL'),
      userInfoURL: this.configService.get<string>('GITHUB_USER_INFO_URL'),
      userEmailURL: this.configService.get<string>('GITHUB_USER_EMAIL_URL'),
    };
  }

  authorize(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.callbackURL,
      scope: this.config.scope.join(' '),
      response_type: 'code',
    });

    return `${this.config.authURL}?${params.toString()}`;
  }

  async callback(code: string): Promise<OAuthUser> {
    const tokenResponse = await this.exchangeCodeForToken(code);
    const userInfo = await this.getUserInfo(tokenResponse.access_token);
    const userEmails = await this.getUserEmails(tokenResponse.access_token);

    // Find primary email
    const primaryEmail = userEmails.find(
      (email: any) => email.primary && email.verified,
    );
    const email = primaryEmail?.email || userEmails[0]?.email || userInfo.email;

    return {
      id: userInfo.id.toString(),
      email: email,
      firstName: userInfo.name?.split(' ')[0] || '',
      lastName: userInfo.name?.split(' ').slice(1).join(' ') || '',
      picture: userInfo.avatar_url,
      emailVerified: primaryEmail?.verified || false,
    };
  }

  getProviderName(): string {
    return 'github';
  }

  private async exchangeCodeForToken(
    code: string,
  ): Promise<{ access_token: string }> {
    const response = await fetch(this.config.tokenURL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        redirect_uri: this.config.callbackURL,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    return response.json();
  }

  private async getUserInfo(accessToken: string) {
    const response = await fetch(this.config.userInfoURL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'NestJS-OAuth-App',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    return response.json();
  }

  private async getUserEmails(accessToken: string) {
    const response = await fetch(this.config.userEmailURL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'NestJS-OAuth-App',
      },
    });

    if (!response.ok) {
      return [];
    }

    return response.json();
  }
}
