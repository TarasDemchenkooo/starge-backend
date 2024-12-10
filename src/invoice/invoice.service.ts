import { Injectable, NotFoundException } from '@nestjs/common'
import { InvoiceDto } from './dto/invoice.dto'
import { PrismaService } from 'src/prisma.service'
import * as crypto from 'crypto'
import * as cron from 'node-cron'
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

    onModuleInit() {
        cron.schedule('*/1 * * * *', async () => {
            await this.cleanupInvoices()
        })
    }

    private async cleanupInvoices() {
        await Promise.all([
            this.prisma.invoice.deleteMany({
                where: {
                    createdAt: {
                        lt: new Date(Date.now() - 10 * 60 * 1000)
                    },
                    status: 'INITIALIZED'
                }
            }),
            this.prisma.invoice.deleteMany({
                where: {
                    createdAt: {
                        lt: new Date(Date.now() - 30 * 60 * 1000)
                    },
                    status: 'APPROVED'
                }
            }),
            this.prisma.invoice.deleteMany({
                where: {
                    createdAt: {
                        lt: new Date(Date.now() - 60 * 60 * 1000)
                    },
                    status: 'PAYED'
                }
            })
        ])
    }

    openInvoice(id: string, invoice: InvoiceDto, lpFee: number, bchFees: number) {
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

    async generateLink(id: string, hash: string) {
        try {
            const invoice = await this.prisma.invoice.update({
                where: { userId: id, hash },
                data: { status: 'APPROVED' }
            })

            await this.tonService.validateExchangeAmount(
                invoice.starsAmount, invoice.tokenAmount, invoice.tokenSymbol)
            const invoiceLink = await this.bot.generateInvoiceLink(invoice)
            return { invoiceLink }
        } catch (error) {
            throw new NotFoundException('Price slippage exceeded')
        }
    }
}
