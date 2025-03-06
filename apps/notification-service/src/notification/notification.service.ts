import { DatabaseService } from "@db"
import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Transaction } from "@shared"
import axios from "axios"
import { formatCaption } from "./utils/formatCaption"
import * as photos from './assets/photos.json'

@Injectable()
export class NotificationService {
    constructor(
        private readonly db: DatabaseService,
        private readonly env: ConfigService
    ) { }

    async notify(transaction: Transaction) {
        const tx = await this.db.transaction.update({
            where: { chargeId: transaction.chargeId },
            data: { hash: transaction.hash, status: transaction.success ? 'CONFIRMED' : 'FAILED' },
            select: { tokenSymbol: true, user: { select: { settings: { select: { notifications: true } } } } }
        })

        if (tx.user.settings.notifications) {
            await axios.post(`https://api.telegram.org/bot${this.env.get('BOT_TOKEN')}/sendPhoto`, {
                chat_id: transaction.userId,
                photo: photos[tx.tokenSymbol][transaction.success ? 'confirmed' : 'failed'],
                caption: formatCaption({
                    address: transaction.address,
                    amount: transaction.amount,
                    route: tx.tokenSymbol,
                    success: transaction.success
                }),
                parse_mode: "MarkdownV2",
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: "View Details",
                            url: `https://t.me/${this.env.get('BOT_USERNAME')}/?startapp=charge_id=${transaction.chargeId}`
                        }]
                    ]
                }
            })
        }
    }
}
