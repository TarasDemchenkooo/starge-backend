import { Module } from "@nestjs/common"
import { AppBotUpdate } from "./app-bot.update"
import { AppBotService } from "./app-bot.service"
import { TelegrafModule } from "nestjs-telegraf"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { AppBotController } from "./app-bot.controller"
import { DatabaseModule } from "@db"

@Module({
    imports: [
        DatabaseModule,
        TelegrafModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            botName: 'app',
            useFactory: (configService: ConfigService) => ({
                token: configService.get('APP_BOT_TOKEN')
            })
        }),
        ClientsModule.register([
            {
                name: 'BATCH_PROCESSING_SERVICE',
                transport: Transport.KAFKA,
                options: {
                    client: {
                        clientId: 'batch-processing',
                        brokers: ['localhost:29092'],
                    },
                    producerOnlyMode: true,
                },
            },
        ])
    ],
    controllers: [AppBotController],
    providers: [AppBotUpdate, AppBotService]
})

export class AppBotModule { }