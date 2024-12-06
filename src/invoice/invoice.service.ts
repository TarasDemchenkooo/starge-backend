import { Injectable, NotFoundException } from '@nestjs/common'
import { InvoiceDto } from './dto/invoice.dto'
import { PrismaService } from 'src/prisma.service'
import * as crypto from 'crypto'
import { BotService } from 'src/bot/bot.service'
import { invoiceSelect } from 'src/selects'
import { TonService } from 'src/ton/ton.service'

@Injectable()
export class InvoiceService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly bot: BotService,
        private readonly tonService: TonService
    ) { }

    openInvoice(id: number, invoice: InvoiceDto, lpFee: number, bchFees: number) {
        const hash = crypto.randomBytes(32).toString('hex')

        return this.prisma.invoice.create({
            data: {
                user: {
                    connect: { id }
                },
                address: invoice.address,
                starsAmount: invoice.source,
                tokenAmount: invoice.target,
                tokenSymbol: invoice.route,
                lpFee,
                bchFees,
                hash
            },
            select: invoiceSelect
        })
    }

    async generateLink(id: number, hash: string) {
        try {
            const invoice = await this.prisma.invoice.update({
                where: { userId: id, hash },
                data: { canBeDeleted: false }
            })

            await this.tonService.validateExchangeAmount(
                invoice.starsAmount, invoice.tokenAmount, invoice.tokenSymbol)
            const invoiceLink = await this.bot.generateInvoiceLink(invoice)
            return { invoiceLink }
        } catch (error) {
            throw new NotFoundException('The invoice has expired')
        }
    }
}
