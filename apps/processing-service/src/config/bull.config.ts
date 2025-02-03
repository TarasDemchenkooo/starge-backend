import { BullRootModuleOptions } from "@nestjs/bullmq"
import { ConfigService } from "@nestjs/config"

export const buildBullConfig = (configService: ConfigService): BullRootModuleOptions => ({
    connection: {
        host: configService.get('REDIS_HOST'),
        port: Number(configService.get('REDIS_PORT'))
    },
    // defaultJobOptions: {
    //     attempts: 3,
    //     backoff: {
    //         type: 'exponential',
    //         delay: 1000
    //     },

    //     removeOnComplete: true
    // }
})