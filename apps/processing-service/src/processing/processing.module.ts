import { Module } from "@nestjs/common"
import { ProcessingController } from "./processing.controller"
import { ProcessingService } from "./processing.service"
import { DatabaseModule } from "@db"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { BlockchainModule } from "../blockchain/blockchain.module"

@Module({
  imports: [
    DatabaseModule,
    BlockchainModule,
    ClientsModule.register([
      {
        name: 'BATCH_MONITORING_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'batch-monitoring',
            brokers: ['localhost:29092'],
          },
          producerOnlyMode: true,
        },
      },
    ])
  ],
  controllers: [ProcessingController],
  providers: [ProcessingService],
})
export class ProcessingModule { }