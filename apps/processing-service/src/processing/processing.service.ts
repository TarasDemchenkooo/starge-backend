import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { KafkaContext } from "@nestjs/microservices"
import { Consumer } from "@nestjs/microservices/external/kafka.interface"
import { Message } from "./types/message"
import { MonitoringService } from "../monitoring/monitoring.service"
import { BlockchainService } from "../blockchain/blockchain.service"
import { TonClient } from "@ton/ton"
import { BatchConfig } from "./types/batchConfig"
import { PaidRequestDto } from "@shared"

@Injectable()
export class ProcessingService {
    private client: TonClient
    private buffer: Message[] = []
    private timer: NodeJS.Timeout
    private readonly batchConfig: BatchConfig

    constructor(
        private readonly configService: ConfigService,
        private readonly monitoringService: MonitoringService,
        private readonly blockchainService: BlockchainService
    ) {
        this.client = this.monitoringService.getClient()
        this.batchConfig = {
            size: Number(configService.get('BATCH_SIZE')),
            timeout: Number(configService.get('BATCH_TIMEOUT')) * 1000
        }
    }

    addToBatch(data: PaidRequestDto, context: KafkaContext) {
        const consumer = context.getConsumer()

        this.buffer.push({
            message: data,
            partition: context.getPartition(),
            offset: context.getMessage().offset
        })

        if (this.buffer.length === this.batchConfig.size) {
            this.processTransaction(this.buffer, consumer)
        } else {
            if (!this.timer) {
                this.timer = setTimeout(() => {
                    if (this.buffer.length !== 0) {
                        this.processTransaction(this.buffer, consumer)
                    }
                }, this.batchConfig.timeout)
            }
        }
    }

    async processTransaction(batch: Message[], consumer: Consumer) {
        const topic = `${this.configService.get('ASSET')}-requests`
        const partitions = [...new Set(batch.map(message => message.partition))]
        consumer.pause([{ topic, partitions }])
        clearTimeout(this.timer)
        this.timer = undefined
        this.buffer = []

        try {
            const queryId = await this.monitoringService.getQueryId()
            const createdAt = Math.floor(Date.now() / 1000) - 60
            await this.blockchainService.sendBatch(this.client, batch, queryId, createdAt)
            await this.monitoringService.nextQueryId()
        } catch (error) {
            console.error(error)
        } finally {
            consumer.resume([{ topic, partitions }])
        }
    }
}