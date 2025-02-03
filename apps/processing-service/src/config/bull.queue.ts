import { RegisterQueueOptions } from "@nestjs/bullmq";
import { ConfigService } from "@nestjs/config";

export const registerBullQueue = (configService: ConfigService): RegisterQueueOptions => ({
    name: `${configService.get('ASSET').toLowerCase()}-batches`
})