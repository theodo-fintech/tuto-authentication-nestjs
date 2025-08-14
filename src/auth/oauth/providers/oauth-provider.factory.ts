import { Injectable, NotFoundException } from '@nestjs/common';
import { OAuthProviderInterface } from '../interfaces/oauth-provider.interface';
import { OAuthProviderName } from '../types/oauth-provider-config.type';
import { GoogleOAuthProvider } from './google-oauth.provider';
import { GitHubOAuthProvider } from './github-oauth.provider';
import { MicrosoftOAuthProvider } from './microsoft-oauth.provider';

@Injectable()
export class OAuthProviderFactory {
  private providers = new Map<OAuthProviderName, OAuthProviderInterface>();

  constructor(
    private googleProvider: GoogleOAuthProvider,
    private githubProvider: GitHubOAuthProvider,
    private microsoftProvider: MicrosoftOAuthProvider,
  ) {
    this.registerProvider('google', this.googleProvider);
    this.registerProvider('github', this.githubProvider);
    this.registerProvider('microsoft', this.microsoftProvider);
  }

  registerProvider(
    name: OAuthProviderName,
    provider: OAuthProviderInterface,
  ): void {
    this.providers.set(name, provider);
  }

  getProvider(name: OAuthProviderName): OAuthProviderInterface {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new NotFoundException(`OAuth provider ${name} not found`);
    }
    return provider;
  }

  getSupportedProviders(): OAuthProviderName[] {
    return Array.from(this.providers.keys());
  }
}
