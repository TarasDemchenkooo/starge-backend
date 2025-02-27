import { Controller } from "@nestjs/common"
import { ProcessingService } from "./processing.service"
import { EventPattern, Payload } from "@nestjs/microservices"
import { Batch } from "./types/batch"

@Controller()
export class ProcessingController {
    constructor(private readonly processingService: ProcessingService) {}

    @EventPattern(`${process.env.ASSET.toLowerCase()}-batches`)
    async processBatch(@Payload() batch: Batch) {
        await this.processingService.sendBatch(batch)
    }
}
