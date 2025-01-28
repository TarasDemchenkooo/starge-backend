import { BadRequestException, Injectable } from '@nestjs/common'
import * as tokens from '../../public/tokens.json'
import { Symbol } from '@prisma/client'
import axios from 'axios'
import { ConfigService } from '@nestjs/config'
import { InvoiceDto } from '../invoice/dto/invoice.dto'

@Injectable()
export class TonService {
    private readonly apiUrl: string
    private readonly apiKey: string
    private readonly starPrice: number
    private readonly bchFees_ton: number
    private readonly bchFees_jetton: number

    constructor(private readonly configService: ConfigService) {
        this.apiUrl = this.configService.get<string>('TONAPI_URL')
        this.apiKey = this.configService.get<string>('TONAPI_KEY')
        this.starPrice = Number(this.configService.get<string>('STAR_PRICE'))
        this.bchFees_ton = Number(this.configService.get<string>('BCH_FEES_TON'))
        this.bchFees_jetton = Number(this.configService.get<string>('BCH_FEES_JETTON'))
    }

    async validateExchangeAmount(source: number, target: number, route: Symbol) {
        const token = tokens.find(token => token.symbol as Symbol === route)
        const ca = token.ca || 'ton'

        const response = await axios.get(`${this.apiUrl}/rates?tokens=${ca}&currencies=usd`, {
            headers: { Authorization: `Bearer ${this.apiKey}` }
        })

        const data = response.data.rates
        const tokenPrice = data[Object.keys(data)[0]].prices.USD

        const currencyPrice = this.starPrice / tokenPrice
        const index = currencyPrice < 1 ? 3 : 4
        const scientificNotation = currencyPrice.toExponential(index)
        const formattedPrice = Number(scientificNotation)

        const expectedSource = Math.ceil(target / formattedPrice)
        const expectedTarget = formattedPrice * source

        const sourceDiff = Math.abs(expectedSource - source) / expectedSource
        const targetDiff = Math.abs(expectedTarget - target) / expectedTarget

        const priceSlippage = Number(this.configService.get<string>('PRICE_SLIPPAGE'))
        const isAcceptableSlippage = sourceDiff <= priceSlippage || targetDiff <= priceSlippage

        if (!isAcceptableSlippage) {
            throw new BadRequestException('Price slippage exceeded')
        }
    }

    async calculateFees(invoice: InvoiceDto): Promise<{ lpFee: number, bchFees: number }> {
        const comissionRate = Number(this.configService.get<string>('COMISSION_RATE'))
        const lpFee = Math.ceil(invoice.source * comissionRate)
        const bchFees = invoice.route === 'TON' ? this.bchFees_ton : this.bchFees_jetton

        return {
            lpFee,
            bchFees
        }
    }
}
