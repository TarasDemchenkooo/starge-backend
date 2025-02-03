import { Module } from '@nestjs/common'
import { BotModule } from './bot/bot.module'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/apps/bot-service/.env`,
      isGlobal: true
    }),
    BotModule
  ]
})

export class AppModule { }
