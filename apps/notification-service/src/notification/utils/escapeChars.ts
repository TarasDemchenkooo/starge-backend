export const escapeChars = (text: string) => {
    const escapeChars = ['-', '_', '+', '/', '.']

    let escapedText = text

    escapeChars.forEach(char => {
        const regexp = new RegExp(`\\${char}`, 'g')
        escapedText = escapedText.replace(regexp, `\\\\${char}`)
    })

    return escapedText
}