import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Consumer, Kafka } from "kafkajs"
import { consumerConfig } from "../config/consumer.config"
import { LoggerEvents, Transaction } from "@shared"
import axios from "axios"
import { WINSTON_MODULE_PROVIDER } from "nest-winston"
import { Logger } from "winston"

@Injectable()
export class RefundService implements OnModuleInit, OnModuleDestroy {
    private readonly kafka: Kafka
    private readonly consumer: Consumer

    constructor(
        private readonly env: ConfigService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
    ) {
        this.kafka = new Kafka({
            clientId: 'refund-service',
            brokers: this.env.get('BROKERS').split(';')
        })

        this.consumer = this.kafka.consumer(consumerConfig)
    }

    async onModuleInit() {
        await this.consumer.connect()
        await this.consumer.subscribe({ topic: 'refund', fromBeginning: true })

        await this.consumer.run({
            eachMessage: async ({ message }) => {
                const transaction: Transaction = JSON.parse(message.value.toString())
                const refundBody = {
                    user_id: transaction.userId,
                    telegram_payment_charge_id: transaction.chargeId
                }

                try {
                    const url = `https://api.telegram.org/bot${this.env.get('BOT_TOKEN')}/refundStarPayment`

                    await axios.post(url, refundBody)
                } catch (error) {
                    if (!error.response.data?.description?.includes('CHARGE_ALREADY_REFUNDED')) {
                        this.logger.error(LoggerEvents.REFUND_ERROR, {
                            context: JSON.stringify(refundBody),
                            trace: error.stack
                        })

                        throw new Error(error.message)
                    }
                }
            }
        })
    }

    async onModuleDestroy() {
        await this.consumer.disconnect()
    }
}
