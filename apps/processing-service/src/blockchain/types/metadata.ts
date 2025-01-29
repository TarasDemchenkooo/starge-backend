export interface WalletMetadata {
    address: string
    jettonAddress: string
    secretKey: Buffer
    subwalletId: number
    timeout: number
}