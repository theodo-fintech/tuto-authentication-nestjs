import { OAuthProviderConfig } from './oauth-provider-config.type';

export interface MicrosoftOAuthConfig extends OAuthProviderConfig {
  tenantId?: string;
  authURL?: string;
  tokenURL?: string;
}
