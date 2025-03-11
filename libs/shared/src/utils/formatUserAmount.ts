export function formatUserAmount(amount: number, type: 'source' | 'target') {
    const amountString = String(amount)
    const regexp = /\B(?=(\d{3})+(?!\d))/g

    if (type === 'source') {
        return amountString.replace(regexp, ',')
    } else {
        const [int, dec] = amountString.split('.')

        const intFormatted = int.replace(regexp, ',')
        const decFormatted = amountString.includes('.') ? `.${dec}` : ''

        return intFormatted.concat(decFormatted)
    }
}
