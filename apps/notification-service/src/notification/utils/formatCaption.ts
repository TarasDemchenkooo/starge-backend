import { Caption } from "../types/caption"

export const formatCaption = (data: Caption) => {
    if (data.success) {
        const title = "_*Your swap has been successfully processed\\!*_"
        const addressTitle = "*Receiver address:*"
        const userAddress = `>\`${data.address}\``
        const amountTitle = "*Amount:*"
        const userAmount = `>\`${data.amount} $${data.route}\``
        const tip = "_You can check the transaction details using the link below\\._"

        return `${title}\n\n${addressTitle}\n${userAddress}\n\n${amountTitle}\n${userAmount}\n\n${tip}`
    } else {
        const title = "_*Your swap could not be processed due to an error\\.*_"
        const addressTitle = "*Receiver address:*"
        const userAddress = `>\`${data.address}\``
        const amountTitle = "*Amount:*"
        const userAmount = `>\`${data.amount} $${data.route}\``
        const refund = "*We will automatically refund your payment within 15 minutes\\. If you have any questions, you can contact our support\\.*"
        const tip = "_You can check the transaction details using the link below\\._"

        return `${title}\n\n${addressTitle}\n${userAddress}\n\n${amountTitle}\n${userAmount}\n\n${refund}\n\n${tip}`
    }
}
