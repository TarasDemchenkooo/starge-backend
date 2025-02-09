interface Transaction {
    hash: string
    success: boolean
    action_phase: {
        skipped_actions: number
    }
}

export interface Trace {
    transaction: Transaction,
    children?: Trace[]
}