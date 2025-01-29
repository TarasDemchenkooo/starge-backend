import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { KafkaContext } from "@nestjs/microservices"
import { Consumer } from "@nestjs/microservices/external/kafka.interface"
import { WithdrawalRequestDto } from "libs/dto/request.dto"
import { Message } from "./types/message"
import { MonitoringService } from "../monitoring/monitoring.service"
import { BlockchainService } from "../blockchain/blockchain.service"
import { TonClient } from "@ton/ton"

@Injectable()
export class ProcessingService {
    private client: TonClient
    private buffer: Message[] = []
    private readonly BATCH_SIZE = 10
    private timer: NodeJS.Timeout
    private readonly timeout = 15 * 1000

    constructor(
        private readonly configService: ConfigService,
        private readonly monitoringService: MonitoringService,
        private readonly blockchainService: BlockchainService
    ) {
        this.client = this.monitoringService.getClient()
    }

    addToBatch(data: WithdrawalRequestDto, context: KafkaContext) {
        const consumer = context.getConsumer()

        this.buffer.push({
            message: data,
            partition: context.getPartition(),
            offset: context.getMessage().offset
        })

        if (this.buffer.length === this.BATCH_SIZE) {
            this.processTransaction(this.buffer, consumer)
        } else {
            if (!this.timer) {
                this.timer = setTimeout(() => {
                    if (this.buffer.length !== 0) {
                        this.processTransaction(this.buffer, consumer)
                    }
                }, this.timeout)
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

            partitions.forEach(async partition => {
                const partitionedMessages = batch.filter(message => message.partition === partition)
                const { offset } = partitionedMessages.reduce((max, current) => {
                    return BigInt(current.offset) > BigInt(max.offset) ? current : max
                })

                await consumer.commitOffsets([{ topic, partition, offset }])
            })

            await this.monitoringService.nextQueryId()
        } catch (error) {
            console.error(error)
        } finally {
            consumer.resume([{ topic, partitions }])
        }
    }
}