import { Module } from '@nestjs/common'
import { BotService } from './bot.service'
import { UserModule } from '../user/user.module'
import { TonModule } from '../ton/ton.module'
import { BotUpdate } from './bot.update'
import { TelegrafModule } from 'nestjs-telegraf'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ClientsModule, Transport } from '@nestjs/microservices'

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PROCESSING_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'processing',
            brokers: ['localhost:29092'],
          },
          producerOnlyMode: true,
        },
      },
    ]),
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
  providers: [BotService, BotUpdate],
  exports: [BotService]
})
export class BotModule { }
