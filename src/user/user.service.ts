import { Injectable } from '@nestjs/common'
import { Invoice } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'
import { UpdateSettingsDto } from './dto/settings.dto'
import { settingsSelect, transactionSelect, userSelect } from 'src/selects'

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
                    invoices: { create: [] },
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

    createTransaction(invoice: Invoice) {
        return this.prisma.transaction.create({
            data: {
                user: {
                    connect: { id: invoice.userId }
                },
                address: invoice.address,
                starsAmount: invoice.starsAmount,
                tokenAmount: invoice.tokenAmount,
                tokenSymbol: invoice.tokenSymbol,
                hash: null,
                lpFee: invoice.lpFee,
                bchFees: invoice.bchFees
            }
        })
    }
}
