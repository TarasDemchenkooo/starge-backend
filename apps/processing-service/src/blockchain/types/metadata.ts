export interface WalletMetadata {
    address: string
    secretKey: Buffer
    subwalletId: number
    timeout: number
}