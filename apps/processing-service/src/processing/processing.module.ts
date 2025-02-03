import { Module } from "@nestjs/common"
import { ProcessingController } from "./processing.controller"
//import { ProcessingService } from "./processing.service"
import { DatabaseModule } from "@db"
import { BlockchainModule } from "../blockchain/blockchain.module"
import { BullModule } from "@nestjs/bullmq"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { buildBullConfig } from "../config/bull.config"
import { registerBullQueue } from "../config/bull.queue"

@Module({
  imports: [
    DatabaseModule,
    BlockchainModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: buildBullConfig
    }),
    BullModule.registerQueueAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: registerBullQueue
    })
  ],
  controllers: [ProcessingController],
  //providers: [ProcessingService],
})

export class ProcessingModule { }