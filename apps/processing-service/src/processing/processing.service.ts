import { Injectable, OnModuleInit } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Consumer, Kafka } from "kafkajs"
import { buildConsumerConfig } from "../config/consumer.config"
import { PaidRequestDto } from "@shared"
import { BlockchainService } from "../blockchain/blockchain.service"
import { InjectQueue } from "@nestjs/bullmq"
import { Queue } from "bullmq"
import { DatabaseService } from "@db"
import { findMissing } from "./utils/findMissing"

@Injectable()
export class ProcessingService implements OnModuleInit {
    private readonly asset: string
    private readonly kafka: Kafka
    private readonly consumer: Consumer
    private queryId: number

    constructor(
        private readonly configService: ConfigService,
        private readonly blockchainService: BlockchainService,
        @InjectQueue('validate-queue') private readonly bullQueue: Queue,
        private readonly db: DatabaseService
    ) {
        this.asset = this.configService.get('ASSET').toLowerCase()

        this.kafka = new Kafka({
            clientId: `${this.asset}-processor`,
            brokers: this.configService.get('BROKERS').split(';')
        })

        this.consumer = this.kafka.consumer(buildConsumerConfig(configService))
    }

    async onModuleInit() {
        const wallet = await this.db.wallet.findUnique({where: {address: ''}})
        this.queryId = findMissing(wallet.usedQueries.map(query => query.queryId))

        await this.consumer.connect()
        await this.consumer.subscribe({ topic: `${this.asset}-requests` })

        await this.consumer.run({
            eachBatch: async ({ batch }) => {
                const batchToSend: PaidRequestDto[] = batch.messages.map(
                    message => JSON.parse(message.value.toString())
                )

                const ext_hash = await this.blockchainService.sendBatch(batchToSend, this.queryId)

                await this.bullQueue.add('validate-trace', {
                    hash: ext_hash,
                    batch: batchToSend
                })
            }
        })
    }
}