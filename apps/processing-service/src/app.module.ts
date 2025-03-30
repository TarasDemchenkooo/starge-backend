import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ProcessingModule } from './processing/processing.module'
import { BlockchainModule } from './blockchain/blockchain.module'
import { ValidatingModule } from './validating/validating.module'
import { BullModule } from '@nestjs/bullmq'
import { buildBullConfig } from './config/bull/bull.config'
import { WinstonModule } from 'nest-winston'
import { winstonConfig } from '@shared'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: buildBullConfig
    }),
    WinstonModule.forRoot(winstonConfig),
    ProcessingModule,
    ValidatingModule,
    BlockchainModule
  ],
})

export class AppModule { }
