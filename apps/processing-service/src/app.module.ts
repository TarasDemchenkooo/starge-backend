import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ProcessingModule } from './processing/processing.module'
import { BlockchainModule } from './blockchain/blockchain.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/apps/processing-service/.env`,
      isGlobal: true
    }),
    ProcessingModule,
    BlockchainModule
  ],
})
export class AppModule { }
