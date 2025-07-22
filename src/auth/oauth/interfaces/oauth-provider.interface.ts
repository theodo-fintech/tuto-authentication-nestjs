import { OAuthUser } from '../types/oauth-user.type';

export interface OAuthProviderInterface {
  authorize(): string;
  callback(code: string): Promise<OAuthUser>;
  getProviderName(): string;
}
