import { Transaction } from "./transaction"

export interface JobData {
    hash: string,
    batch: Transaction[]
}
