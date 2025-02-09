import { ConfigService } from "@nestjs/config"
import { ConsumerConfig } from "kafkajs"

export const buildConsumerConfig = (configService: ConfigService): ConsumerConfig => ({
    groupId: `${configService.get('ASSET').toLowerCase()}-processors`,
    allowAutoTopicCreation: false,
    minBytes: Number(configService.get('MIN_BATCH_SIZE')),
    maxBytes: Number(configService.get('MAX_BATCH_SIZE')),
    maxWaitTimeInMs: Number(configService.get('REQUEST_TIMEOUT')),
    retry: {
        retries: 0
    }
})