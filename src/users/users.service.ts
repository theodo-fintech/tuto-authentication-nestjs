import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { OAuthUser } from '../auth/oauth/types/oauth-user.type';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findOneByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  findOneById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  createFromOAuthUser(oauthUser: OAuthUser): Promise<User> {
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
}
