import { Symbol } from "@prisma/client"
import { escapeChars } from "./escapeChars"

export const formatCaption = (address: string, amount: number, route: Symbol) => {
    const title = "_*Your swap has been successfully processed\\\\!*_"
    const addressTitle = "*Receiver address:*"
    const userAddress = `>\`${escapeChars(address)}\``
    const amountTitle = "*Amount:*"
    const userAmount = `>\`${escapeChars(String(amount))} $${route}\``
    const tip = "_You can check the transaction details using the link below\\\\._"

    return `${title}\n\n${addressTitle}\n${userAddress}\n\n${amountTitle}\n${userAmount}\n\n${tip}`
}