import { BadRequestException, Injectable } from '@nestjs/common'
import { DatabaseService } from '@db'
import { ConfigService } from '@nestjs/config'
import * as assets from './assets/assets.json'
import axios, { AxiosError } from 'axios'
import { parseInvoice } from './utils/invoiceParser'

@Injectable()
export class PaymentService {
    constructor(
        private readonly db: DatabaseService,
        private readonly configService: ConfigService,
    ) { }

    async checkPayment(invoice: string) {
        const parsedData = parseInvoice(invoice)

        if (Date.now() > parsedData.validUntil) {
            throw new BadRequestException('This invoice link has expired')
        }

        const token = assets.find(token => token.symbol === parsedData.route)
        const ca = token.ca || 'ton'

        const tonapiUrl = this.configService.get('TONAPI_URL')
        const tonapiKey = this.configService.get('TONAPI_KEY')
        const starPrice = Number(this.configService.get('STAR_PRICE'))
        const priceSlippage = Number(this.configService.get('SLIPPAGE'))

        try {
            const response = await axios.get(`${tonapiUrl}/rates?tokens=${ca}&currencies=usd`, {
                headers: { Authorization: `Bearer ${tonapiKey}` }
            })

            const rates = response.data.rates
            const tokenPrice = rates[Object.keys(rates)[0]].prices.USD

            const currencyPrice = starPrice / tokenPrice
            const index = currencyPrice < 1 ? 3 : 4
            const scientificNotation = currencyPrice.toExponential(index)
            const formattedPrice = Number(scientificNotation)

            const expectedSource = Math.ceil(parsedData.target / formattedPrice)
            const expectedTarget = formattedPrice * parsedData.source

            const sourceDiff = Math.abs(expectedSource - parsedData.source) / expectedSource
            const targetDiff = Math.abs(expectedTarget - parsedData.target) / expectedTarget

            const isAcceptableSlippage = sourceDiff <= priceSlippage || targetDiff <= priceSlippage

            if (!isAcceptableSlippage) throw new Error()
        } catch (error) {
            throw new BadRequestException(error instanceof AxiosError ?
                'Internal server error' : 'Price slippage exceeded')
        }
    }

    async processPayment(userId: string, invoice: string, chargeId: string) {
        const { address, source, target, route, lpFee, bchFees } = parseInvoice(invoice)

        await this.db.$transaction(async tx => {
            await tx.transaction.create({
                data: {
                    user: { connect: { id: userId } },
                    address,
                    starsAmount: source,
                    tokenAmount: target,
                    tokenSymbol: route,
                    lpFee,
                    bchFees,
                    chargeId: chargeId,
                }
            })

            await tx.outbox.create({
                data: {
                    payload: {
                        userId,
                        address,
                        amount: target,
                        chargeId
                    },
                    tokenSymbol: route
                }
            })
        })
    }
}
