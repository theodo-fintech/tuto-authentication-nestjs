import { OAuthProviderConfig } from './oauth-provider-config.type';

export interface GitHubOAuthConfig extends OAuthProviderConfig {
  authURL: string;
  tokenURL: string;
  userInfoURL: string;
  userEmailURL: string;
}
