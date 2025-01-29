import { Controller, OnModuleInit, ValidationPipe } from "@nestjs/common"
import { ProcessingService } from "./processing.service"
import { Ctx, EventPattern, KafkaContext, Payload } from "@nestjs/microservices"
import { ConfigService } from "@nestjs/config"
import { Symbol } from "@prisma/client"
import { WithdrawalRequestDto } from "libs/dto/request.dto"

@Controller()
export class ProcessingController implements OnModuleInit {
    private static asset: Symbol

    constructor(
        private readonly configService: ConfigService,
        private readonly processingService: ProcessingService
    ) { }

    onModuleInit() {
        ProcessingController.asset = this.configService.get('ASSET') as Symbol
    }

    @EventPattern(`${() => ProcessingController.asset}-requests`)
    processTransaction(@Payload(ValidationPipe) data: WithdrawalRequestDto, @Ctx() context: KafkaContext) {
        this.processingService.addToBatch(data, context)
    }
}