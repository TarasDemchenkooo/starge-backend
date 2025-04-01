import { Injectable } from '@nestjs/common'
import { UpdateSettingsDto } from './dto/settings.dto'
import { DatabaseService } from '@db'
import { formatUserAmount, InvoiceDto } from '@shared'
import { ConfigService } from '@nestjs/config'
import { PaymentFees } from './types/paymentFees'
import axios from 'axios'

@Injectable()
export class UserService {
    private readonly paymentFees: PaymentFees
    private readonly botToken: string

    constructor(
        private readonly configService: ConfigService,
        private readonly db: DatabaseService
    ) {
        this.paymentFees = {
            comission: Number(this.configService.get('COMISSION')),
            tonFees: Number(this.configService.get('TON_FEES')),
            jettonFees: Number(this.configService.get('JETTON_FEES'))
        }

        this.botToken = this.configService.get('BOT_TOKEN')
    }

    async create(id: string) {
        await this.db.user.upsert({
            where: { id },
            update: {},
            create: { id, transactions: { create: [] } },
        })
    }

    async generateLink({ address, source, target, route }: InvoiceDto) {
        const userSource = formatUserAmount(source, 'source')
        const userTarget = formatUserAmount(target, 'target')
        const lpFee = Math.ceil(source * this.paymentFees.comission)
        const bchFees = route === 'TON' ? this.paymentFees.tonFees : this.paymentFees.jettonFees

        const title = `${userTarget} ${route}`
        const description = `Swap ${userSource} STAR${source > 1 ? 'S' : ''} for ${userTarget} ${route}`
        const validUntil = Date.now() + 15 * 60 * 1000
        const payload = [address, source, target, route, lpFee, bchFees, validUntil].join(':')
        const provider_token = ''
        const currency = 'XTR'
        const price = source + lpFee + bchFees
        const prices = [{ label: title, amount: price }]

        const response = await axios.post(`https://api.telegram.org/bot${this.botToken}/createInvoiceLink`, {
            title, description, payload, provider_token, currency, prices
        })

        return { invoiceLink: response.data.result }
    }

    getHistory(id: string) {
        return this.db.transaction.findMany({
            where: { userId: id }
        })
    }

    getSettings(id: string) {
        return this.db.user.findUnique({ where: { id }, select: { notifications: true } })
    }

    updateSettings(id: string, settings: UpdateSettingsDto) {
        return this.db.user.update({
            where: { id },
            data: settings,
            select: { notifications: true }
        })
    }
}
