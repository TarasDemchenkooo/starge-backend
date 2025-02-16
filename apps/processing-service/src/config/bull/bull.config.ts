import { BullRootModuleOptions } from "@nestjs/bullmq"
import { ConfigService } from "@nestjs/config"

export const buildBullConfig = (configService: ConfigService): BullRootModuleOptions => ({
    connection: {
        host: configService.get('REDIS_HOST'),
        port: Number(configService.get('REDIS_PORT'))
    },
    defaultJobOptions: {
        attempts: 3,
        delay: configService.get('VALIDATING_DELAY'),
        backoff: {
            type: 'exponential',
            delay: 2000
        },
        removeOnComplete: 1000,
        removeOnFail: 1000
    }
})