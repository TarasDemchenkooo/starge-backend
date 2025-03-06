import { Module } from '@nestjs/common'
import { AggregatorModule } from './aggregator/aggregator.module'
import { ConfigModule } from '@nestjs/config'

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AggregatorModule
    ]
})

export class AppModule { }
