import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { JwtStrategy } from './strategies/jwt.strategy'
import { UserModule } from '../user/user.module'
import { buildJwtConfig } from '../config/jwt.config'

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: buildJwtConfig
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy]
})

export class AuthModule { }