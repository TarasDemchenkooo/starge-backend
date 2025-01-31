import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { Symbol } from '@prisma/client'
import { InjectBot } from 'nestjs-telegraf'
import { Telegraf } from 'telegraf'
import { ClientKafka } from '@nestjs/microservices'
import { DatabaseService } from '@db'
import { InvoiceDto, PaidRequestDto } from '@shared'
import { ConfigService } from '@nestjs/config'
import { PaymentParams } from './types/paymentParams'
import assets from './assets/assets.json'
import axios from 'axios'
import { parseInvoice } from './utils/invoiceParser'

@Injectable()
export class AppBotService {
    private readonly paymentParams: PaymentParams
    private readonly tonapiUrl: string
    private readonly tonapiKey: string

    constructor(
        private readonly db: DatabaseService,
        private readonly configService: ConfigService,
        @InjectBot('app') private readonly appBot: Telegraf,
        @Inject('PROCESSING_SERVICE') private readonly processingProducer: ClientKafka
    ) {
        this.paymentParams = {
            starPrice: Number(this.configService.get('STAR_PRICE')),
            comission: Number(this.configService.get('COMISSION')),
            priceSlippage: Number(this.configService.get('SLIPPAGE')),
            tonFees: Number(this.configService.get('TON_FEES')),
            jettonFees: Number(this.configService.get('JETTON_FEES'))
        }
        this.tonapiUrl = this.configService.get('TONAPI_URL')
        this.tonapiKey = this.configService.get('TONAPI_KEY')
    }

    async generatePaymentLink({ address, source, target, route }: InvoiceDto) {
        const lpFee = Math.ceil(source * this.paymentParams.comission)
        const bchFees = route === 'TON' ? this.paymentParams.tonFees : this.paymentParams.jettonFees

        const title = `${target} ${route}`
        const description = `Confirm your swap of ${title} for ${source} STARS`
        const validUntil = Date.now() + 15 * 60 * 1000
        const payload = [address, source, target, route, lpFee, bchFees, validUntil].join(':')
        const provider_token = ''
        const currency = 'XTR'
        const price = source + lpFee + bchFees
        const prices = [{ label: title, amount: 1 }]

        return this.appBot.telegram.createInvoiceLink({ title, description, payload, provider_token, currency, prices })
    }

    async checkPayment(invoice: string) {
        const parsedData = parseInvoice(invoice)

        if (Date.now() > parsedData.validUntil) {
            throw new Error('This invoice link has expired')
        }

        const token = assets.find(token => token.symbol === parsedData.route)
        const ca = token.ca || 'ton'

        const response = await axios.get(`${this.tonapiUrl}/rates?tokens=${ca}&currencies=usd`, {
            headers: { Authorization: `Bearer ${this.tonapiKey}` }
        })

        const rates = response.data.rates
        const tokenPrice = rates[Object.keys(rates)[0]].prices.USD

        const currencyPrice = this.paymentParams.starPrice / tokenPrice
        const index = currencyPrice < 1 ? 3 : 4
        const scientificNotation = currencyPrice.toExponential(index)
        const formattedPrice = Number(scientificNotation)

        const expectedSource = Math.ceil(parsedData.target / formattedPrice)
        const expectedTarget = formattedPrice * parsedData.source

        const sourceDiff = Math.abs(expectedSource - parsedData.source) / expectedSource
        const targetDiff = Math.abs(expectedTarget - parsedData.target) / expectedTarget

        const isAcceptableSlippage =
            sourceDiff <= this.paymentParams.priceSlippage ||
            targetDiff <= this.paymentParams.priceSlippage

        if (!isAcceptableSlippage) {
            throw new BadRequestException('Price slippage exceeded')
        }
    }

    async processPayment(userId: string, invoice: string, chargeId: string) {
        const { address, source, target, route, lpFee, bchFees } = parseInvoice(invoice)

        await this.db.transaction.create({
            data: {
                user: {
                    connect: { id: userId }
                },
                address,
                starsAmount: source,
                tokenAmount: target,
                tokenSymbol: route,
                lpFee,
                bchFees,
                chargeId: chargeId,
                hash: null,
            }
        })

        this.processingProducer.emit<string, PaidRequestDto>(`${route}-requests`, {
            address,
            amount: target,
            chargeId
        })
    }
}
