import { Module } from '@nestjs/common'
import { AggregatorModule } from './aggregator/aggregator.module'
import { ConfigModule } from '@nestjs/config'
import { WinstonModule } from 'nest-winston'
import { winstonConfig } from '@shared'

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        WinstonModule.forRoot(winstonConfig),
        AggregatorModule
    ]
})

export class AppModule { }
