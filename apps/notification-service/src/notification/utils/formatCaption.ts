import { formatUserAmount } from "@shared"
import { Caption } from "../types/caption"

export const formatCaption = (data: Caption) => {
    const addressTitle = "*Receiver address:*"
    const userAddress = `>\`${data.address}\``
    const amountTitle = "*Amount:*"
    const userAmount = `>\`${formatUserAmount(data.amount, 'target')} ${data.route}\``
    const tip = "_You can check the transaction details using the link below\\._"

    if (data.success) {
        const title = "_*Your swap has been successfully processed\\!*_"

        return `${title}\n\n${addressTitle}\n${userAddress}\n\n${amountTitle}\n${userAmount}\n\n${tip}`
    } else {
        const title = "_*Your swap could not be processed due to an error\\.*_"
        const refund = `*We will automatically refund your payment within 5 minutes\\. If you have any questions, you can contact our [support](https://t.me/${process.env.SUPPORT_USERNAME})\\.*`

        return `${title}\n\n${addressTitle}\n${userAddress}\n\n${amountTitle}\n${userAmount}\n\n${refund}\n\n${tip}`
    }
}
