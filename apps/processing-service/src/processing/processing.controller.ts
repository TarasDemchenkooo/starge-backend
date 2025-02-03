import { Controller, ValidationPipe } from "@nestjs/common"
//import { ProcessingService } from "./processing.service"
import { Ctx, EventPattern, KafkaContext, Payload } from "@nestjs/microservices"
import { PaidRequestDto } from "@shared"
import * as dotenv from 'dotenv'
import { InjectQueue } from "@nestjs/bullmq"
import { Queue } from "bullmq"

dotenv.config({
    path: `${process.cwd()}/apps/processing-service/.env`
})

const asset = process.env.ASSET.toLowerCase()

@Controller()
export class ProcessingController {
    //constructor(@InjectQueue(`${asset}-batches`) private readonly requestsQueue: Queue) { }

    @EventPattern(`${asset}-requests`)
    accumulateBatch(@Payload(ValidationPipe) data: PaidRequestDto, @Ctx() context: KafkaContext) {
        console.log(data)
    }
}