import { BullRootModuleOptions } from "@nestjs/bullmq"
import { ConfigService } from "@nestjs/config"

export const buildBullConfig = (configService: ConfigService): BullRootModuleOptions => ({
    connection: {
        host: configService.get('REDIS_HOST'),
        port: Number(configService.get('REDIS_PORT'))
    },
    defaultJobOptions: {
        attempts: 5,
        delay: configService.get('VALIDATING_DELAY'),
        backoff: {
            type: 'exponential',
            delay: 1000
        },
        removeOnComplete: {
            age: Number(configService.get('WALLET_TIMEOUT'))
        },
        removeOnFail: 1000
    }
})
