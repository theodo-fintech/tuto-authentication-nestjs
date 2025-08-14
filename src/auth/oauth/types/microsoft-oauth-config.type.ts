import { OAuthProviderConfig } from './oauth-provider-config.type';

export interface MicrosoftOAuthConfig extends OAuthProviderConfig {
  authURL: string;
  tokenURL: string;
  userInfoURL: string;
}
