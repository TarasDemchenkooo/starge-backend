import { Transaction } from "@shared"

export interface Batch {
    queryId: number
    batch: Transaction[]
}
