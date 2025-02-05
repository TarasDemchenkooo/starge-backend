export function findMissing(queries: number[]): number {
    const set = new Set(queries)
    let missing = 0

    while (set.has(missing)) {
        missing++
    }

    return missing
}