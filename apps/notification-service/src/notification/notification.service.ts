import { DatabaseService } from "@db"
import { Injectable } from "@nestjs/common"
import { JobData } from "@shared"

@Injectable()
export class NotificationService {
    constructor(private readonly db: DatabaseService) { }

    async notify({ hash, batch }: JobData) {
        const chargeIds = batch.map(request => request.chargeId)
        const users = batch.map(request => request.userId)

        await this.db.transaction.updateMany({
            where: { chargeId: { in: chargeIds } },
            data: { hash, status: 'CONFIRMED' }
        })

        const notificationList = await this.db.settings.findMany({
            where: { userId: { in: users }, notifications: true },
            select: { userId: true }
        })
    }
}
