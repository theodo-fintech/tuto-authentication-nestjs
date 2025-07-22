import { OAuthProviderConfig } from './oauth-provider-config.type';

export interface GoogleOAuthConfig extends OAuthProviderConfig {
  authURL?: string;
  tokenURL?: string;
}
