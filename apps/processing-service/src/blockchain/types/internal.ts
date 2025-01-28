import { OutAction } from "@ton/core"

export interface InternalMessage {
    address: string
    queryId: number
    outActions: OutAction[]
}