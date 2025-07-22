import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User, OAuthAccount, Prisma } from '@prisma/client';
import { OAuthUser } from './types/oauth-user.type';
import { OAuthProviderName } from './types/oauth-provider-config.type';

@Injectable()
export class OAuthAccountsService {
  constructor(private prisma: PrismaService) {}

  findOneByProvider(
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

  async findManyByUserId(userId: number): Promise<OAuthAccount[]> {
    return this.prisma.oAuthAccount.findMany({
      where: { userId },
    });
  }

  create(
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

  update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
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
