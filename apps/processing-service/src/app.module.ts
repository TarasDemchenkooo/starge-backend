import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ProcessingModule } from './processing/processing.module'
import { MonitoringModule } from './monitoring/monitoring.module'
import { BlockchainModule } from './blockchain/blockchain.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    ProcessingModule,
    BlockchainModule,
    MonitoringModule
  ],
})
export class AppModule { }
