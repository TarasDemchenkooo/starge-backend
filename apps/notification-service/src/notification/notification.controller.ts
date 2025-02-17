import { Controller } from "@nestjs/common"
import { EventPattern, Payload } from "@nestjs/microservices"
import { ResolvedBatchDto } from "@shared"
import { NotificationService } from "./notification.service"

@Controller()
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}
    
    @EventPattern('resolved-batches')
    async notify(@Payload() batch: ResolvedBatchDto) {
        await this.notificationService.notify(batch)
    }
}