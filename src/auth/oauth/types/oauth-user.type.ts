export interface OAuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
  emailVerified?: boolean;
}
