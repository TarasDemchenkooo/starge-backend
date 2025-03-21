import { ConfigService } from "@nestjs/config"
import { TelegrafModuleOptions } from "nestjs-telegraf"

export const buildBotConfig = (configService: ConfigService): TelegrafModuleOptions => ({
    token: configService.get<string>('BOT_TOKEN'),
    launchOptions: {
        webhook: {
            domain: configService.get<string>('BOT_HOST'),
            path: configService.get<string>('BOT_SECRET_PATH'),
            secretToken: configService.get<string>('BOT_API_SECRET')
        }
    }
})
