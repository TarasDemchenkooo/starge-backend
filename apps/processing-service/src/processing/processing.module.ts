import { Module } from "@nestjs/common"
import { ProcessingService } from "./processing.service"
import { DatabaseModule } from "@db"
import { BlockchainModule } from "../blockchain/blockchain.module"
import { BullModule } from "@nestjs/bullmq"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { registerBullQueue } from "../config/bull/bullQueue.config"

@Module({
  imports: [
    DatabaseModule,
    BlockchainModule,
    BullModule.registerQueueAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      name: 'validate-queue',
      useFactory: registerBullQueue
    })
  ],
  providers: [ProcessingService],
})

export class ProcessingModule { }