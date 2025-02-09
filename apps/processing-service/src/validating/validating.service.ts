import { Processor, WorkerHost } from "@nestjs/bullmq"
import axios from "axios"
import { DelayedError, Job, UnrecoverableError } from "bullmq"
import dotenv from 'dotenv'
import { JobData } from "./types/job"
import { Trace } from "./types/trace"
import { ClientKafka } from "@nestjs/microservices"
import { Inject } from "@nestjs/common"
import { delayJob } from "./utils/delay"

const { ASSET, TONAPI_URL, TONAPI_KEY } =
    dotenv.config({ path: `${process.cwd()}/apps/processing-service/.env` }).parsed

Processor(`${ASSET}-batches`, { concurrency: 5 })
export class ValidatingService extends WorkerHost {
    constructor(@Inject('BATCHES_EMITTER') private readonly batchesEmitter: ClientKafka) {
        super()
    }

    async process(job: Job<JobData>, token: string) {
        const { data: trace, status } = await axios.get<Trace>(`${TONAPI_URL}/traces/${job.data.hash}`, {
            headers: { Authorization: `Bearer ${TONAPI_KEY}` },
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

        if (ASSET !== 'TON') {
            if (trace.children[0].children?.length !== job.data.batch.length) {
                await delayJob(job, 5, 'Trace is loading for transactions on self jetton wallet')
            }

            const successList = trace.children[0].children.map(childTrace => childTrace.transaction.success)

            if (successList.filter(Boolean).length !== job.data.batch.length) {
                throw new UnrecoverableError(`Jetton transfers were not successful`)
            }
        }

        this.batchesEmitter.emit<string, JobData>('notifications', {
            hash: trace.transaction.hash,
            batch: job.data.batch
        })
    }
}