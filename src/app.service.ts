import { Injectable } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { User } from '@prisma/client';

@Injectable()
export class AppService {
  constructor(private usersService: UsersService) {}
  async getHello(userId: number): Promise<string> {
    const user: User = await this.usersService.findOneById(userId);
    return `Hello ${user.firstName}!`;
  }
}
