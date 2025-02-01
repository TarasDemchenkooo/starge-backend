import { Controller, ValidationPipe } from "@nestjs/common"
import { ProcessingService } from "./processing.service"
import { Ctx, EventPattern, KafkaContext, Payload } from "@nestjs/microservices"
import { PaidRequestDto } from "@shared"
import * as dotenv from 'dotenv'

dotenv.config({
    path: `${process.cwd()}/apps/processing-service/.env`
})

@Controller()
export class ProcessingController {
    constructor(private readonly processingService: ProcessingService) { }

    @EventPattern(`${process.env.ASSET}-requests`)
    processTransaction(@Payload(ValidationPipe) data: PaidRequestDto, @Ctx() context: KafkaContext) {
        this.processingService.addToBatch(data, context)
    }
}