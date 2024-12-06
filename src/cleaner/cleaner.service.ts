import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import * as cron from 'node-cron'

@Injectable()
export class CleanerService implements OnModuleInit {
    constructor(private readonly prisma: PrismaService) { }

    onModuleInit() {
        cron.schedule('*/1 * * * *', async () => {
            await this.cleanupInvoices()
        })
    }

    private async cleanupInvoices() {
        await this.prisma.invoice.deleteMany({
            where: {
                createdAt: {
                    lt: new Date(Date.now() - 5 * 60 * 1000)
                },
                canBeDeleted: true
            }
        })

        await this.prisma.invoice.deleteMany({
            where: {
                createdAt: {
                    lt: new Date(Date.now() - 60 * 60 * 1000)
                },
                canBeDeleted: false
            }
        })
    }

    deleteInvoice(userId: number, hash: string) {
        return this.prisma.invoice.delete({
            where: { userId, hash }
        })
    }
}
