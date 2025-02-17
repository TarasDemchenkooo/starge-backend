import { Module } from "@nestjs/common"
import { NotificationController } from "./notification.controller"
import { NotificationService } from "./notification.service"
import { DatabaseModule } from "@db"

@Module({
    imports: [DatabaseModule],
    controllers: [NotificationController],
    providers: [NotificationService]
})

export class NotificationModule {}