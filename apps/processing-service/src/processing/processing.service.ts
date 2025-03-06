import { Injectable } from "@nestjs/common"
import { BlockchainService } from "../blockchain/blockchain.service"
import { InjectQueue } from "@nestjs/bullmq"
import { Queue } from "bullmq"
import { Batch } from "./types/batch"
import { ConfigService } from "@nestjs/config"
import { JobData } from "../validating/types/job"

@Injectable()
export class ProcessingService {
    constructor(
        private readonly env: ConfigService,
        private readonly blockchainService: BlockchainService,
        @InjectQueue('validate-queue') private readonly bullQueue: Queue<JobData>,
    ) { }

    async sendBatch(batch: Batch) {
        const ext_hash = await this.blockchainService.sendBatch(batch)

        await this.bullQueue.add('validate-trace', {
            hash: ext_hash,
            batch: batch.batch
        }, {
            deduplication: {
                id: String(batch.queryId),
                ttl: Number(this.env.get('WALLET_TIMEOUT')) * 1000
            }
        })
    }
}
