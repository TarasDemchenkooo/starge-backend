import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as tokens from '../../public/tokens.json'
import axios from 'axios'
import { Symbol } from '@prisma/client'
import { InvoiceDto } from './dto/invoice.dto'
import { PrismaService } from 'src/prisma.service'
import * as crypto from 'crypto'
import { BotService } from 'src/bot/bot.service'
import { Decimal } from '@prisma/client/runtime/library'

@Injectable()
export class PaymentsService {
    private apiUrl: string
    private apiKey: string
    private starPrice: number
    private priceSlippage: number
    private comissionRate: number

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
        private readonly bot: BotService
    ) {
        this.apiUrl = this.configService.get<string>('TONAPI_URL')
        this.apiKey = this.configService.get<string>('TONAPI_KEY')
        this.starPrice = Number(this.configService.get<string>('STAR_PRICE'))
        this.priceSlippage = Number(this.configService.get<string>('PRICE_SLIPPAGE'))
        this.comissionRate = Number(this.configService.get<string>('COMISSION_RATE'))
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

        const isAcceptableSlippage = sourceDiff <= this.priceSlippage || targetDiff <= this.priceSlippage

        if (!isAcceptableSlippage) {
            throw new BadRequestException('Price slippage error')
        }
    }

    async calculateFees(source: number, address: string) {
        const lpFee = Math.ceil(source * this.comissionRate)
        const bchFees = 16

        return {
            lpFee,
            bchFees
        }
    }

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
            select: {
                address: true,
                starsAmount: true,
                tokenAmount: true,
                tokenSymbol: true,
                lpFee: true,
                bchFees: true,
                hash: true
            }
        })
    }

    async generateLink(id: number, hash: string) {
        try {
            const invoice = await this.prisma.invoice.update({
                where: { userId: id, hash },
                data: { canBeDeleted: false }
            })

            await this.validateExchangeAmount(invoice.starsAmount,
                invoice.tokenAmount as unknown as number, invoice.tokenSymbol)

            return this.bot.generateInvoiceLink(invoice)
        } catch (error) {
            throw new NotFoundException('The invoice has expired')
        }
    }
}
