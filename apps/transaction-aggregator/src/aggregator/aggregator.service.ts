import { DatabaseService } from "@db"
import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Cron } from "@nestjs/schedule"
import { Symbol } from "@prisma/client"
import { Kafka, Producer } from "kafkajs"
import { producerConfig } from "../config/producer"
import Redis from "ioredis"
import { luaScript } from "./utils/lua.script"

@Injectable()
export class AggregatorService implements OnModuleInit, OnModuleDestroy {
    private readonly kafka: Kafka
    private readonly producer: Producer
    private readonly redis: Redis
    private readonly asset: Symbol
    private readonly batchSize: number
    private readonly limit: number

    constructor(
        private readonly db: DatabaseService,
        private readonly env: ConfigService
    ) {
        this.asset = this.env.get('ASSET').toLowerCase()
        this.batchSize = Number(this.env.get('BATCH_SIZE'))
        this.limit = Number(this.env.get('LIMIT'))

        this.kafka = new Kafka({
            clientId: `${this.asset}-aggregator`,
            brokers: this.env.get('BROKERS').split(';')
        })

        this.producer = this.kafka.producer(producerConfig)

        this.redis = new Redis({
            host: this.env.get('REDIS_HOST'),
            port: Number(this.env.get('REDIS_PORT'))
        })
    }

    async onModuleInit() {
        await this.producer.connect()
    }

    async onModuleDestroy() {
        await this.producer.disconnect()
    }

    @Cron('*/15 * * * * *', { waitForCompletion: true })
    async aggregate() {
        const txs = await this.db.outbox.updateManyAndReturn({
            where: { locked: false, tokenSymbol: this.asset.toUpperCase() as Symbol },
            data: { locked: true },
            select: { id: true, payload: true },
            limit: this.limit
        })

        if (txs.length === 0) return

        const cleanTxs = txs.map(tx => tx.payload)
        const batches = []

        for (let i = 0; i < txs.length; i += this.batchSize) {
            const batch = cleanTxs.slice(i, i + this.batchSize)

            if (batch.length < Math.ceil(0.4 * this.batchSize) && i !== 0) {
                batches[batches.length - 1].push(...batch)
            } else {
                batches.push(batch)
            }
        }

        const queryIds = await this.redis.eval(
            luaScript, 0,
            this.asset, batches.length, 2 * Number(this.env.get('WALLET_TIMEOUT'))
        )

        const messages = batches.map((batch, ind) => ({
            value: JSON.stringify({
                queryId: Number(queryIds[ind]),
                batch
            })
        }))

        await this.producer.send({
            topic: `${this.asset}-batches`,
            messages,
            acks: 1
        })

        await this.db.outbox.deleteMany({
            where: { id: { in: txs.map(tx => tx.id) } }
        })
    }
}
