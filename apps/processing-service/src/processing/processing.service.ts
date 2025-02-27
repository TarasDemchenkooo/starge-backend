import { Injectable } from "@nestjs/common"
import { BlockchainService } from "../blockchain/blockchain.service"
import { InjectQueue } from "@nestjs/bullmq"
import { Queue } from "bullmq"
import { Batch } from "./types/batch"
import { JobData } from "@shared"

@Injectable()
export class ProcessingService {
    constructor(
        private readonly blockchainService: BlockchainService,
        @InjectQueue('validate-queue') private readonly bullQueue: Queue<JobData>,
    ) { }

    async sendBatch({ batch, queryId }: Batch) {
        const ext_hash = await this.blockchainService.sendBatch(batch, queryId)
        await this.bullQueue.add('validate-trace', { hash: ext_hash, batch })
    }
}
