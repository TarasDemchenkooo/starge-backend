import { DatabaseService } from "@db"
import { Inject, Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { LoggerEvents, Transaction } from "@shared"
import axios from "axios"
import { formatCaption } from "./utils/formatCaption"
import { photos } from "./assets/photos"
import { Logger } from "winston"
import { WINSTON_MODULE_PROVIDER } from "nest-winston"
import { KafkaRetriableException } from "@nestjs/microservices"

@Injectable()
export class NotificationService {
    constructor(
        private readonly db: DatabaseService,
        private readonly env: ConfigService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
    ) { }

    async notify(transaction: Transaction) {
        let stage = 0
        let context = transaction

        try {
            const tx = await this.db.transaction.update({
                where: { chargeId: transaction.chargeId },
                data: { hash: transaction.hash, status: transaction.success ? 'CONFIRMED' : 'FAILED' },
                select: { tokenSymbol: true, user: { select: { notifications: true } } }
            })

            stage = 1

            if (tx.user.notifications) {
                const postUrl = `https://api.telegram.org/bot${this.env.get('BOT_TOKEN')}/sendPhoto`
                const msgBtnUrl = `https://t.me/${this.env.get('BOT_USERNAME')}/?startapp=charge_id=${transaction.chargeId}`

                await axios.post(postUrl, {
                    chat_id: transaction.userId,
                    photo: photos[tx.tokenSymbol][transaction.success ? 'confirmed' : 'failed'],
                    caption: formatCaption({
                        address: transaction.address,
                        amount: transaction.amount,
                        route: tx.tokenSymbol,
                        success: transaction.success
                    }),
                    parse_mode: "MarkdownV2",
                    reply_markup: { inline_keyboard: [[{ text: "View Details", url: msgBtnUrl }]] }
                })
            }
        } catch (error) {
            this.logger.error(LoggerEvents.NOTIFICATION_ERROR, {
                context: JSON.stringify({ stage, data: context }),
                trace: error.stack
            })

            throw new KafkaRetriableException(error.message)
        }
    }
}
