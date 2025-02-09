import { Symbol } from "@prisma/client"

export interface WalletMetadata {
    asset: Symbol
    address: string
    jettonAddress: string
    secretKey: Buffer
    subwalletId: number
    timeout: number
}