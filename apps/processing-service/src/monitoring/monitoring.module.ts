import { Module } from "@nestjs/common"
import { ScheduleModule } from "@nestjs/schedule"
import { MonitoringService } from "./monitoring.service"

@Module({
    imports: [ScheduleModule.forRoot()],
    providers: [MonitoringService],
    exports: [MonitoringService]
})
export class MonitoringModule {}