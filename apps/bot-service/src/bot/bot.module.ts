import { Module } from "@nestjs/common"
import { BotUpdate } from "./bot.update"
import { BotService } from "./bot.service"
import { TelegrafModule } from "nestjs-telegraf"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { DatabaseModule } from "@db"
import { buildBotConfig } from "../config/bot/bot.config"

@Module({
    imports: [
        DatabaseModule,
        TelegrafModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: buildBotConfig
        })
    ],
    providers: [BotUpdate, BotService]
})

export class BotModule { }
