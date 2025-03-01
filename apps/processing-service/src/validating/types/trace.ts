interface Transaction {
    hash: string
    in_msg: {
        decoded_body: {
            custom_payload: string
        }
    }
    success: boolean
    action_phase: {
        skipped_actions: number
    }
}

export interface Trace {
    transaction: Transaction,
    children?: Trace[]
}
