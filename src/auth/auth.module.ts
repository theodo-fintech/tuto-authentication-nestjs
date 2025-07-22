import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalStrategy } from './strategy/local.strategy';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategy/jwt.strategy';
import { OAuthController } from './oauth/oauth.controller';
import { OAuthService } from './oauth/oauth.service';
import { GoogleOAuthProvider } from './oauth/providers/google-oauth.provider';
import { OAuthProviderFactory } from './oauth/providers/oauth-provider.factory';
import { OAuthAccountsService } from './oauth/oauth-accounts.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: parseInt(
            configService.getOrThrow<string>(
              'ACCESS_TOKEN_VALIDITY_DURATION_IN_SEC',
            ),
          ),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, OAuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    OAuthService,
    OAuthAccountsService,
    GoogleOAuthProvider,
    OAuthProviderFactory,
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
