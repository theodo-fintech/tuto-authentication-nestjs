import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User, OAuthAccount } from '@prisma/client';
import { OAuthUser } from './types/oauth-user.type';
import { OAuthProviderName } from './types/oauth-provider-config.type';
import { AuthService } from '../auth.service';
import { AccessToken } from '../types/AccessToken';

@Injectable()
export class OAuthService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async handleOAuthLogin(
    provider: OAuthProviderName,
    oauthUser: OAuthUser,
  ): Promise<User> {
    const oauthAccount = await this.findOAuthAccount(provider, oauthUser.id);

    if (oauthAccount) {
      return oauthAccount.user;
    }

    let user = await this.prisma.user.findUnique({
      where: { email: oauthUser.email },
    });

    if (!user) {
      user = await this.createOAuthUser(oauthUser);
    }

    await this.createOAuthAccount(provider, oauthUser, user);

    return user;
  }

  async handleOAuthCallback(
    provider: OAuthProviderName,
    oauthUser: OAuthUser,
  ): Promise<AccessToken> {
    const user = await this.handleOAuthLogin(provider, oauthUser);
    return this.authService.login(user);
  }

  async findOAuthAccount(
    provider: OAuthProviderName,
    providerId: string,
  ): Promise<(OAuthAccount & { user: User }) | null> {
    return this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId,
        },
      },
      include: {
        user: true,
      },
    });
  }

  async createOAuthUser(oauthUser: OAuthUser): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: oauthUser.email,
        firstName: oauthUser.firstName,
        lastName: oauthUser.lastName,
        isOAuthUser: true,
        password: null,
      },
    });
  }

  async createOAuthAccount(
    provider: OAuthProviderName,
    oauthUser: OAuthUser,
    user: User,
  ): Promise<OAuthAccount> {
    return this.prisma.oAuthAccount.create({
      data: {
        provider,
        providerId: oauthUser.id,
        email: oauthUser.email,
        userId: user.id,
      },
    });
  }

  async getUserOAuthAccounts(userId: number): Promise<OAuthAccount[]> {
    return this.prisma.oAuthAccount.findMany({
      where: { userId },
    });
  }

  async unlinkOAuthAccount(
    userId: number,
    provider: OAuthProviderName,
  ): Promise<void> {
    await this.prisma.oAuthAccount.deleteMany({
      where: {
        userId,
        provider,
      },
    });
  }
}
