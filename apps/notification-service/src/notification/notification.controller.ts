import { Controller } from "@nestjs/common"
import { EventPattern, Payload } from "@nestjs/microservices"
import { NotificationService } from "./notification.service"
import { JobData } from "@shared"

@Controller()
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @EventPattern('resolved-batches')
    async notify(@Payload() batch: JobData) {
        await this.notificationService.notify(batch)
    }
}
