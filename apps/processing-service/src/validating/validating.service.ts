import { Processor, WorkerHost } from "@nestjs/bullmq"
import axios from "axios"
import { Job, UnrecoverableError } from "bullmq"
import { Trace } from "./types/trace"
import { ClientKafka } from "@nestjs/microservices"
import { Inject } from "@nestjs/common"
import { delayJob } from "./utils/delay"
import { ConfigService } from "@nestjs/config"
import { JobData } from "@shared"

@Processor(`${process.env.ASSET.toLowerCase()}-batches`, { concurrency: 5 })
export class ValidatingService extends WorkerHost {
    constructor(
        @Inject('BATCHES_VALIDATOR') private readonly batchesValidator: ClientKafka,
        private readonly configService: ConfigService
    ) { super() }

    async process(job: Job<JobData>) {
        const { data: trace, status } = await axios.get<Trace>(
            `${this.configService.get('TONAPI_URL')}/traces/${job.data.hash}`, {
            headers: { Authorization: `Bearer ${this.configService.get('TONAPI_KEY')}` },
            validateStatus: status => status === 200 || status === 404,
        })

        if (status === 404) {
            await delayJob(job, 15, 'Trace not found')
        }

        if (trace.transaction.action_phase.skipped_actions === 1) {
            throw new UnrecoverableError('Internal message value exceeds balance')
        }

        if (!trace.children) {
            await delayJob(job, 5, 'Trace is loading for transaction with opcode 0xae42e5a4')
        }

        if (!trace.children[0].transaction.success) {
            throw new UnrecoverableError('Internal transfer was not successful')
        }

        if (this.configService.get('ASSET') !== 'TON') {
            if (trace.children[0].children?.length !== job.data.batch.length) {
                await delayJob(job, 5, 'Trace is loading for transactions on self jetton wallet')
            }

            const successList = trace.children[0].children.map(childTrace => childTrace.transaction.success)

            if (successList.filter(Boolean).length !== job.data.batch.length) {
                throw new UnrecoverableError(`Jetton transfers were not successful`)
            }
        }

        this.batchesValidator.emit<string, JobData>('resolved-batches', {
            hash: trace.transaction.hash,
            batch: job.data.batch
        })
    }
}
