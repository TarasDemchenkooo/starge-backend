import { Invoice, Settings, Transaction } from "@prisma/client"

const settingsSelect: Partial<Record<keyof Settings, boolean>> = {
    tokenSymbol: true,
    vibration: true,
    notifications: true
}

const invoiceSelect: Partial<Record<keyof Invoice, boolean>> = {
    address: true,
    starsAmount: true,
    tokenAmount: true,
    tokenSymbol: true,
    lpFee: true,
    bchFees: true,
    hash: true,
}

const transactionSelect: Partial<Record<keyof Transaction, boolean>> = {
    ...invoiceSelect,
    status: true,
    createdAt: true
}

const userSelect = {
    id: true,
    transactions: { select: transactionSelect },
    settings: { select: settingsSelect }
}

export { userSelect, settingsSelect, invoiceSelect, transactionSelect }