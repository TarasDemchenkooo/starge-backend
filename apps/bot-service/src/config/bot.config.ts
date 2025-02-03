import { ConfigService } from "@nestjs/config"
import { TelegrafModuleOptions } from "nestjs-telegraf"

export const buildBotConfig = (configService: ConfigService): TelegrafModuleOptions => ({
    token: configService.get('BOT_TOKEN'),
    launchOptions: {
        webhook: {
            domain: configService.get('HOST'),
            path: configService.get('WEBHOOK_PATH')
        }
    }
})