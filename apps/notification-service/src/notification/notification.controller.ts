import { Controller } from "@nestjs/common"
import { EventPattern, Payload } from "@nestjs/microservices"
import { NotificationService } from "./notification.service"
import { Transaction } from "@shared"

@Controller()
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @EventPattern('notify')
    async notify(@Payload() transaction: Transaction) {
        await this.notificationService.notify(transaction)
    }
}
