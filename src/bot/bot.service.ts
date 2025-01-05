import { Injectable } from '@nestjs/common'
import { Symbol } from '@prisma/client'
import { InjectBot } from 'nestjs-telegraf'
import { InvoiceDto } from 'src/invoice/dto/invoice.dto'
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

    async checkPayment(invoice: string) {
        const data = invoice.split(':')

        if (Date.now() > Number(data[6])) {
            throw new Error('This invoice link has expired')
        }

        await this.tonService.validateExchangeAmount(Number(data[1]), Number(data[2]), data[3] as Symbol)
    }

    async generateInvoiceLink({ data, lpFee, bchFees }: { data: InvoiceDto, lpFee: number, bchFees: number }) {
        const title = `${data.target} ${data.route}`
        const description = `Confirm your swap of ${title} for ${data.source} STARS`
        const validUntil = Date.now() + 15 * 60 * 1000
        const payload = [data.address, data.source, data.target, data.route, lpFee, bchFees, validUntil].join(':')
        const provider_token = ''
        const currency = 'XTR'
        const price = data.source + lpFee + bchFees
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
