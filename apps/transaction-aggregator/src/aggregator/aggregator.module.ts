import { Module } from "@nestjs/common"
import { ScheduleModule } from "@nestjs/schedule"
import { AggregatorService } from "./aggregator.service"
import { DatabaseModule } from "@db"

@Module({
    imports: [
        DatabaseModule,
        ScheduleModule.forRoot()
    ],
    providers: [AggregatorService]
})

export class AggregatorModule { }
