import { Transaction } from "@shared"

export interface JobData {
    hash: string,
    batch: Transaction[]
}
