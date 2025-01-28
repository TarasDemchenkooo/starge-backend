import { Module } from "@nestjs/common"
import { MonitoringService } from "../monitoring/monitoring.service"
import { ProcessingController } from "./processing.controller"
import { ProcessingService } from "./processing.service"
import { BlockchainService } from "../blockchain/blockchain.service"

@Module({
  imports: [MonitoringService, BlockchainService],
  controllers: [ProcessingController],
  providers: [ProcessingService],
})
export class ProcessingModule { }