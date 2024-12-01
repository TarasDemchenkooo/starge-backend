import { Module } from '@nestjs/common'
import { UserModule } from './user/user.module'
import { AuthModule } from './auth/auth.module'
import { ConfigModule } from '@nestjs/config'
import { PaymentsModule } from './payments/payments.module';
import { CleanupModule } from './cleanup/cleanup.module';
import { BotModule } from './bot/bot.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    UserModule,
    AuthModule,
    PaymentsModule,
    CleanupModule,
    BotModule
  ],
})

export class AppModule { }
