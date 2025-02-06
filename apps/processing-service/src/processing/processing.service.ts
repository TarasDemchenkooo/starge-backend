import { Injectable, OnModuleInit } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Consumer, Kafka } from "kafkajs"
import { buildConsumerConfig } from "../config/consumer.config"
import { PaidRequestDto } from "@shared"
import { BlockchainService } from "../blockchain/blockchain.service"
import { InjectQueue } from "@nestjs/bullmq"
import { Queue } from "bullmq"
import { DatabaseService } from "@db"
import { nextQueryId } from "./utils/nextQueryId"

@Injectable()
export class ProcessingService implements OnModuleInit {
    private readonly asset: string
    private readonly walletAddress: string
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
        this.walletAddress = this.configService.get('WALLET_ADDRESS')

        this.kafka = new Kafka({
            clientId: `${this.asset}-processor`,
            brokers: this.configService.get('BROKERS').split(';')
        })

        this.consumer = this.kafka.consumer(buildConsumerConfig(configService))
    }

    async onModuleInit() {
        this.queryId = nextQueryId((
            await this.db.wallet.findUnique({
                where: { address: this.walletAddress },
                include: { usedQueries: true }
            })
        ).usedQueries)

        await this.consumer.connect()
        await this.consumer.subscribe({ topic: `${this.asset}-requests` })

        await this.consumer.run({
            eachBatch: async ({ batch }) => {
                const batchToSend: PaidRequestDto[] = batch.messages.map(
                    message => JSON.parse(message.value.toString())
                )

                const ext_hash = await this.blockchainService.sendBatch(batchToSend, this.queryId)

                const updatedWallet = await this.db.wallet.update({
                    where: { address: this.walletAddress },
                    data: { usedQueries: { create: { queryId: this.queryId } } },
                    include: { usedQueries: true }
                })
                this.queryId = nextQueryId(updatedWallet.usedQueries)

                await this.bullQueue.add('validate-trace', {
                    hash: ext_hash,
                    batch: batchToSend
                })
            }
        })
    }
}