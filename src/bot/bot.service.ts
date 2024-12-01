import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Invoice } from '@prisma/client'
import { Telegraf } from 'telegraf'

@Injectable()
export class BotService implements OnModuleInit, OnModuleDestroy {
    private bot: Telegraf
    private botToken: string

    constructor(private readonly configService: ConfigService) {
        this.botToken = this.configService.get<string>('BOT_TOKEN')
        this.bot = new Telegraf(this.botToken)
    }

    onModuleInit() {
        this.bot.launch()
    }

    onModuleDestroy() {
        process.once('SIGINT', () => this.bot.stop('SIGINT'))
        process.once('SIGTERM', () => this.bot.stop('SIGTERM'))
    }

    async generateInvoiceLink({ starsAmount, tokenAmount, tokenSymbol, lpFee, bchFees, hash }: Invoice) {
        const title = `${tokenAmount} ${tokenSymbol}`
        const description = `Confirm your swap of ${title} for ${starsAmount} STARS`
        const payload = hash
        const provider_token = ''
        const currency = 'XTR'
        const price = starsAmount + lpFee + bchFees
        const prices = [{ label: title, amount: price }]

        return this.bot.telegram.createInvoiceLink({
            title,
            description,
            payload,
            provider_token,
            currency,
            prices
        })
    }
}
