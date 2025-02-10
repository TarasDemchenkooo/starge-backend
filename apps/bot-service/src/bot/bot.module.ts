import { Module } from "@nestjs/common"
import { BotUpdate } from "./bot.update"
import { BotService } from "./bot.service"
import { TelegrafModule } from "nestjs-telegraf"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { ClientsModule } from "@nestjs/microservices"
import { DatabaseModule } from "@db"
import { buildBotConfig } from "../config/bot/bot.config"
import { buildProducerConfig } from "../config/kafka/producer.config"

@Module({
    imports: [
        DatabaseModule,
        TelegrafModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: buildBotConfig
        }),
        ClientsModule.registerAsync([{
            name: 'REQUESTS_EMITTER',
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: buildProducerConfig
        }])
    ],
    providers: [BotUpdate, BotService]
})

export class BotModule { }