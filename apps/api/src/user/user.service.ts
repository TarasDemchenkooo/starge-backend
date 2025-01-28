import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { UpdateSettingsDto } from './dto/settings.dto'
import { settingsSelect, transactionSelect, userSelect } from '../selects'
import { InvoiceDto } from '../invoice/dto/invoice.dto'

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    async findOrCreate(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: userSelect
        })

        if (!user) {
            return this.prisma.user.create({
                data: {
                    id,
                    transactions: { create: [] },
                    settings: { create: {} }
                },
                select: userSelect
            })
        }

        return user
    }

    updateUserSettings(id: string, settings: UpdateSettingsDto) {
        return this.prisma.settings.update({
            where: { userId: id },
            data: settings,
            select: settingsSelect
        })
    }

    getHistory(id: string) {
        return this.prisma.transaction.findMany({
            where: { userId: id },
            select: transactionSelect
        })
    }

    createTransaction(invoice: {
        userId: string,
        data: InvoiceDto,
        lpFee: number,
        bchFees: number,
        chargeId: string,
    }) {
        return this.prisma.transaction.create({
            data: {
                user: {
                    connect: { id: invoice.userId }
                },
                address: invoice.data.address,
                starsAmount: invoice.data.source,
                tokenAmount: invoice.data.target,
                tokenSymbol: invoice.data.route,
                chargeId: invoice.chargeId,
                hash: null,
                lpFee: invoice.lpFee,
                bchFees: invoice.bchFees
            }
        })
    }
}
