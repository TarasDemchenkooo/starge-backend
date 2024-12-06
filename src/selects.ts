const settingsSelect = {
    tokenSymbol: true,
    vibration: true,
    notifications: true
}

const invoiceSelect = {
    address: true,
    starsAmount: true,
    tokenAmount: true,
    tokenSymbol: true,
    lpFee: true,
    bchFees: true,
    hash: true,
}

const transactionSelect = {
    ...invoiceSelect,
    status: true,
    createdAt: true
}

const userSelect = {
    id: true,
    transactions: { select: transactionSelect },
    settings: { select: settingsSelect }
}

export { userSelect, settingsSelect, invoiceSelect, transactionSelect, }