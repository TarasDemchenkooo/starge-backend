import { Injectable } from '@nestjs/common'
import { BotService } from '../bot/bot.service'
import { TonService } from '../ton/ton.service'
import { InvoiceDto } from './dto/invoice.dto'

@Injectable()
export class InvoiceService {
    constructor(
        private readonly bot: BotService,
        private readonly tonService: TonService
    ) { }

    async generateLink(invoice: InvoiceDto) {
        await this.tonService.validateExchangeAmount(invoice.source, invoice.target, invoice.route)
        const { lpFee, bchFees } = await this.tonService.calculateFees(invoice)
        const invoiceLink = await this.bot.generateInvoiceLink({ data: invoice, lpFee, bchFees })
        return { invoiceLink }
    }
}
