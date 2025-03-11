export interface Transaction {
    userId: string
    address: string
    amount: number
    chargeId: string
    hash: string
    success: boolean
}
