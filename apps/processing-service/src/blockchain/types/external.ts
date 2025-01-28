import { Cell } from "@ton/core"

export interface ExternalMessage {
    address: string
    secretKey: Buffer
    internalMessage: Cell
    queryId: number
    subwalletId: number
    timeout: number
    createdAt: number
}