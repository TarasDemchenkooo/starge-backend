import { Symbol } from "@prisma/client"
import { ParsedInvoice } from "../types/parsedInvoice"

export function parseInvoice(rawInvoice: string): ParsedInvoice {
    const rawData = rawInvoice.split(':')

    return {
        address: rawData[0],
        source: Number(rawData[1]),
        target: Number(rawData[2]),
        route: rawData[3] as Symbol,
        lpFee: Number(rawData[4]),
        bchFees: Number(rawData[5]),
        validUntil: Number(rawData[6])
    }
}