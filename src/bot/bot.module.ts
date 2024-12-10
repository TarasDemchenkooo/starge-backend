import { Module } from '@nestjs/common'
import { BotService } from './bot.service'
import { PrismaService } from 'src/prisma.service'
import { UserModule } from 'src/user/user.module'
import { TonModule } from 'src/ton/ton.module'
import { BotUpdate } from './bot.update'
import { TelegrafModule } from 'nestjs-telegraf'
import { ConfigModule, ConfigService } from '@nestjs/config'

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('BOT_TOKEN')
      })
    }),
    UserModule,
    TonModule
  ],
  providers: [BotService, BotUpdate, PrismaService],
  exports: [BotService]
})
export class BotModule { }
