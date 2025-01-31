import { Module } from '@nestjs/common'
import { AppBotModule } from './app/app-bot.module'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/apps/bot-service/.env`,
      isGlobal: true
    }),
    AppBotModule
  ]
})

export class AppModule { }
