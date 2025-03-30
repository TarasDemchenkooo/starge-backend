import {
    PHASE_1_DELAY, PHASE_1_ERROR, PHASE_2_DELAY,
    PHASE_2_ERROR, PHASE_3_DELAY, PHASE_3_ERROR
} from "./constants/reasons"
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq"
import axios from "axios"
import { DelayedError, Job, UnrecoverableError } from "bullmq"
import { Trace } from "./types/trace"
import { ConfigService } from "@nestjs/config"
import { BlockchainService } from "../blockchain/blockchain.service"
import { Kafka, Producer } from "kafkajs"
import { producerConfig } from "../config/kafka/producer.config"
import { Inject, OnModuleDestroy, OnModuleInit } from "@nestjs/common"
import { JobData } from "./types/job"
import { Cell } from "@ton/core"
import { WINSTON_MODULE_PROVIDER } from "nest-winston"
import { Logger } from "winston"
import { LoggerEvents } from "@shared"

@Processor(`${process.env.ASSET.toLowerCase()}-batches`, { concurrency: 5 })
export class ValidatingService extends WorkerHost implements OnModuleInit, OnModuleDestroy {
    private readonly kafka: Kafka
    private readonly producer: Producer

    constructor(
        private readonly blockchainService: BlockchainService,
        private readonly env: ConfigService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
    ) {
        super()

        this.kafka = new Kafka({
            clientId: `${this.env.get('ASSET').toLowerCase()}-batches-emitter`,
            brokers: this.env.get('BROKERS').split(';')
        })

        this.producer = this.kafka.producer(producerConfig)
    }

    async onModuleInit() {
        await this.producer.connect()
    }

    async onModuleDestroy() {
        await this.producer.disconnect()
    }

    async process(job: Job<JobData>) {
        const { data: trace, status } = await axios.get<Trace>(
            `${this.env.get('TONAPI_URL')}/traces/${job.data.hash}`, {
            headers: { Authorization: `Bearer ${this.env.get('TONAPI_KEY')}` },
            validateStatus: status => status === 200 || status === 404,
        })

        let resolvedBatch = []

        try {
            if (status === 404) throw new DelayedError(PHASE_1_DELAY)

            resolvedBatch = job.data.batch.map(tx => ({
                ...tx,
                hash: trace.transaction.hash,
                success: false
            }))

            if (trace.transaction.action_phase.skipped_actions === 1) {
                throw new UnrecoverableError(PHASE_1_ERROR)
            }

            if (!trace.children) throw new DelayedError(PHASE_2_DELAY)

            if (!trace.children[0].transaction.success) {
                throw new UnrecoverableError(PHASE_2_ERROR)
            }

            if (this.env.get('ASSET') === 'TON') {
                resolvedBatch = resolvedBatch.map(tx => ({ ...tx, success: true }))
            } else {
                if (trace.children[0].children?.length !== job.data.batch.length) {
                    throw new DelayedError(PHASE_3_DELAY)
                }

                resolvedBatch = resolvedBatch.map(tx => {
                    const traceTx = trace.children[0].children.find(child => {
                        const payload = child.transaction.in_msg.decoded_body.custom_payload
                        return tx.chargeId === this.blockchainService.readPayload(Cell.fromHex(payload))
                    })

                    return { ...tx, success: traceTx.transaction.success }
                })

                if (resolvedBatch.some(tx => !tx.success)) {
                    throw new UnrecoverableError(PHASE_3_ERROR)
                }
            }

            const messages = resolvedBatch.map(tx => ({ value: JSON.stringify(tx) }))
            await this.producer.send({ topic: 'notify', messages, acks: 1 })
        } catch (error) {
            if (error instanceof DelayedError) {
                await job.moveToDelayed(Date.now() + 15000, job.token)
                throw new DelayedError(error.message)
            } else if (error instanceof UnrecoverableError) {
                const notifyMessages = resolvedBatch.map(tx => ({ value: JSON.stringify(tx) }))
                const refundMessages = resolvedBatch.filter(tx => !tx.success)
                    .map(tx => ({ value: JSON.stringify(tx) }))

                await this.producer.sendBatch({
                    topicMessages: [
                        { topic: 'notify', messages: notifyMessages },
                        { topic: 'refund', messages: refundMessages }
                    ],
                    acks: 1
                })
            } else {
                throw new Error(error.stack)
            }
        }
    }

    @OnWorkerEvent('failed')
    async validateManually(job: Job) {
        if (job.attemptsMade === 5) {
            this.logger.error(LoggerEvents.VALIDATING_ERROR, {
                context: job.id,
                trace: JSON.stringify(job.stacktrace)
            })
        }
    }
}
