import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { UpdateSettingsDto } from './dto/settings.dto'
import { settingsSelect, transactionSelect, userSelect } from '../selects'
import { ClientKafka } from '@nestjs/microservices'
import { DatabaseService } from '@db'
import { InvoiceDto } from '@shared'

@Injectable()
export class UserService implements OnModuleInit {
    constructor(
        private readonly db: DatabaseService,
        @Inject('TELEGRAM_PAYMENT_SERVICE') private readonly paymentProducer: ClientKafka
    ) { }

    async onModuleInit() {
        this.paymentProducer.subscribeToResponseOf('payments')
        await this.paymentProducer.connect()
    }

    async findOrCreate(id: string) {
        const user = await this.db.user.findUnique({
            where: { id },
            select: userSelect
        })

        if (!user) {
            return this.db.user.create({
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
        return this.db.settings.update({
            where: { userId: id },
            data: settings,
            select: settingsSelect
        })
    }

    async generateLink(invoice: InvoiceDto) {
        return this.paymentProducer.send<string, InvoiceDto>('payments', invoice)
    }

    getHistory(id: string) {
        return this.db.transaction.findMany({
            where: { userId: id },
            select: transactionSelect
        })
    }
}
