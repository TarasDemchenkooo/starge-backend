import { Module } from "@nestjs/common"
import { ProcessingService } from "./processing.service"
import { BlockchainModule } from "../blockchain/blockchain.module"
import { BullModule } from "@nestjs/bullmq"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { registerBullQueue } from "../config/bull/bullQueue.config"
import { ProcessingController } from "./processing.controller"

@Module({
    imports: [
        BlockchainModule,
        BullModule.registerQueueAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            name: 'validate-queue',
            useFactory: registerBullQueue
        })
    ],
    controllers: [ProcessingController],
    providers: [ProcessingService],
})

export class ProcessingModule { }
