import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/users.entity';
import { AccessToken } from './types/AccessToken';
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
  ) {}


  async login(user: User): Promise<AccessToken> {
    const payload = { email: user.email, id: user.id };
    return { access_token: this.jwtService.sign(payload) };
  }

}
