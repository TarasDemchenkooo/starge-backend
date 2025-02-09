import { DelayedError, Job } from "bullmq"

export async function delayJob(job: Job, timeout: number, reason: string) {
    await job.moveToDelayed(Date.now() + timeout * 1000, job.token)
    throw new DelayedError(reason)
}