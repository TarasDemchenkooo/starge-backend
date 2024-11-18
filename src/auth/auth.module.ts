import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { ConfigService } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { JwtStrategy } from './strategies/jwt.strategy'
import { UserService } from 'src/user/user.service'
import { PrismaService } from 'src/prisma.service'

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '0' },
      })
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService, ConfigService,
    UserService, JwtStrategy,
    PrismaService
  ],
})
export class AuthModule { }
