import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User, OAuthAccount, Prisma } from '@prisma/client';
import { OAuthUser } from '../oauth/types/oauth-user.type';
import { OAuthProviderName } from '../oauth/types/oauth-provider-config.type';

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

  async findAccountsByEmail(email: string): Promise<OAuthAccount[]> {
    return this.prisma.oAuthAccount.findMany({
      where: { email },
    });
  }

  async updateAccountEmail(
    provider: OAuthProviderName,
    providerId: string,
    newEmail: string,
  ): Promise<void> {
    await this.prisma.oAuthAccount.updateMany({
      where: {
        provider,
        providerId,
      },
      data: {
        email: newEmail,
      },
    });
  }

  async getAccountStats(userId: number): Promise<{
    totalAccounts: number;
    providers: string[];
    hasPassword: boolean;
  }> {
    const accounts = await this.findManyByUserId(userId);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    return {
      totalAccounts: accounts.length,
      providers: accounts.map((account) => account.provider),
      hasPassword: !!user?.password,
    };
  }

  async findDuplicateAccounts(): Promise<
    Array<{
      email: string;
      accounts: OAuthAccount[];
    }>
  > {
    const accountsGrouped = await this.prisma.oAuthAccount.groupBy({
      by: ['email'],
      having: {
        email: {
          _count: {
            gt: 1,
          },
        },
      },
    });

    const duplicates = [];
    for (const group of accountsGrouped) {
      const accounts = await this.findAccountsByEmail(group.email);
      duplicates.push({
        email: group.email,
        accounts,
      });
    }

    return duplicates;
  }
}
