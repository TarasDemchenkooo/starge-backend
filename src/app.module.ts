import { Module } from '@nestjs/common'
import { UserModule } from './user/user.module'
import { AuthModule } from './auth/auth.module'
import { ConfigModule } from '@nestjs/config'
import { BotModule } from './bot/bot.module'
import { InvoiceModule } from './invoice/invoice.module'
import { TonModule } from './ton/ton.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    AuthModule,
    UserModule,
    InvoiceModule,
    BotModule,
    TonModule,
  ],
})

export class AppModule { }
