import { Module } from "@nestjs/common"
import { TelegrafModule } from "nestjs-telegraf"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { DatabaseModule } from "@db"
import { buildBotConfig } from "../config/bot.config"
import { PaymentUpdate } from "./payment.update"
import { PaymentService } from "./payment.service"

@Module({
    imports: [
        DatabaseModule,
        TelegrafModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: buildBotConfig
        })
    ],
    providers: [PaymentUpdate, PaymentService]
})

export class PaymentModule { }
