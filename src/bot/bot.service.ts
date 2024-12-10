import { Injectable } from '@nestjs/common'
import { Invoice } from '@prisma/client'
import { InjectBot } from 'nestjs-telegraf'
import { PrismaService } from 'src/prisma.service'
import { TonService } from 'src/ton/ton.service'
import { UserService } from 'src/user/user.service'
import { Telegraf } from 'telegraf'

@Injectable()
export class BotService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly user: UserService,
        private readonly tonService: TonService,
        @InjectBot() private bot: Telegraf
    ) { }

    async checkPayment(userId: string, hash: string) {
        const invoice = await this.prisma.invoice.update({
            where: { userId, hash },
            data: { status: 'PAYED' }
        })

        await this.tonService.validateExchangeAmount(
            invoice.starsAmount, invoice.tokenAmount, invoice.tokenSymbol)
        await this.user.createTransaction(invoice)
    }

    async transferTokens(userId: string, hash: string) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { userId, hash }
        })

        await this.tonService.transfer(invoice)
    }

    async generateInvoiceLink({ starsAmount, tokenAmount, tokenSymbol, lpFee, bchFees, hash }: Invoice) {
        const title = `${tokenAmount} ${tokenSymbol}`
        const description = `Confirm your swap of ${title} for ${starsAmount} STARS`
        const payload = hash
        const provider_token = ''
        const currency = 'XTR'
        const price = starsAmount + lpFee + bchFees
        const prices = [{ label: title, amount: 1 }]

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
