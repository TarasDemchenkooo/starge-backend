import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Invoice } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'
import { TonService } from 'src/ton/ton.service'
import { UserService } from 'src/user/user.service'
import { Telegraf } from 'telegraf'

@Injectable()
export class BotService implements OnModuleInit, OnModuleDestroy {
    private bot: Telegraf
    private botToken: string

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
        private readonly user: UserService,
        private readonly tonService: TonService
    ) {
        this.botToken = this.configService.get<string>('BOT_TOKEN')
        this.bot = new Telegraf(this.botToken)
    }

    onModuleInit() {
        this.bot.on('pre_checkout_query', async ctx => {
            const userId = String(ctx.update.pre_checkout_query.from.id)
            const hash = ctx.update.pre_checkout_query.invoice_payload

            try {
                const invoice = await this.prisma.invoice.update({
                    where: { userId, hash },
                    data: { status: 'PAYED' }
                })

                await this.tonService.validateExchangeAmount(
                    invoice.starsAmount, invoice.tokenAmount, invoice.tokenSymbol)
                await this.user.createTransaction(invoice)
                await ctx.answerPreCheckoutQuery(true)
            } catch (error) {
                await ctx.answerPreCheckoutQuery(false, 'The invoice has expired')
            }
        })

        this.bot.on('successful_payment', async ctx => {
            const userId = String(ctx.message.from.id)
            const hash = ctx.message.successful_payment.invoice_payload
            const invoice = await this.prisma.invoice.findUnique({
                where: { userId, hash }
            })

            await this.tonService.transfer(invoice)
        })

        //this.bot.launch()
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
