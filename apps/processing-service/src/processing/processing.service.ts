import { Inject, Injectable } from "@nestjs/common"
import { BlockchainService } from "../blockchain/blockchain.service"
import { InjectQueue } from "@nestjs/bullmq"
import { Queue } from "bullmq"
import { Batch } from "./types/batch"
import { ConfigService } from "@nestjs/config"
import { JobData } from "../validating/types/job"
import { WINSTON_MODULE_PROVIDER } from "nest-winston"
import { Logger } from "winston"
import { LoggerEvents } from "@shared"
import { KafkaRetriableException } from "@nestjs/microservices"

@Injectable()
export class ProcessingService {
    constructor(
        private readonly env: ConfigService,
        private readonly blockchainService: BlockchainService,
        @InjectQueue('validate-queue') private readonly bullQueue: Queue<JobData>,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
    ) { }

    async sendBatch(batch: Batch) {
        let stage = 0
        let context = { hash: null, batch }

        try {
            const ext_hash = await this.blockchainService.sendBatch(batch)

            stage = 1
            context = { hash: ext_hash, batch }

            await this.bullQueue.add('validate-trace', {
                hash: ext_hash,
                batch: batch.batch
            }, {
                deduplication: {
                    id: String(batch.queryId),
                    ttl: Number(this.env.get('WALLET_TIMEOUT')) * 1000
                }
            })
        } catch (error) {
            this.logger.error(LoggerEvents.PROCESSING_ERROR, {
                context: JSON.stringify({ stage, data: context }),
                trace: error.stack
            })

            throw new KafkaRetriableException(error.message)
        }
    }
}
