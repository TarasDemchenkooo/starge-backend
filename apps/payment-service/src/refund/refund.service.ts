import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Consumer, Kafka } from "kafkajs"
import { consumerConfig } from "../config/consumer.config"
import { Transaction } from "@shared"
import axios, { AxiosError } from "axios"

@Injectable()
export class RefundService implements OnModuleInit, OnModuleDestroy {
    private readonly kafka: Kafka
    private readonly consumer: Consumer

    constructor(
        private readonly env: ConfigService
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

                try {
                    await axios.post(`https://api.telegram.org/bot${this.env.get('BOT_TOKEN')}/refundStarPayment`, {
                        user_id: transaction.userId,
                        telegram_payment_charge_id: transaction.chargeId
                    })
                } catch (error) {
                    if (!error.response.data.description.includes('CHARGE_ALREADY_REFUNDED')) {
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
