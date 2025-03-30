import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PaymentModule } from './payment/payment.module'
import { RefundModule } from './refund/refund.module'
import { WinstonModule } from 'nest-winston'
import { winstonConfig } from '@shared'

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        WinstonModule.forRoot(winstonConfig),
        PaymentModule,
        RefundModule
    ]
})

export class AppModule { }
