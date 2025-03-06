import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PaymentModule } from './payment/payment.module'
import { RefundModule } from './refund/refund.module'

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PaymentModule,
        RefundModule
    ]
})

export class AppModule { }
