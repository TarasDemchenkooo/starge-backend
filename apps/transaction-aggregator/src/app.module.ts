import { Module } from '@nestjs/common'
import { AggregatorModule } from './aggregator/aggregator.module'

@Module({
  imports: [AggregatorModule]
})

export class AppModule {}
