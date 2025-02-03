import { Symbol } from "@prisma/client"

export interface ParsedInvoice {
    address: string
    source: number
    target: number
    route: Symbol
    lpFee: number
    bchFees: number
    validUntil: number
}