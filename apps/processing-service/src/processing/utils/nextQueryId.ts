import { Query } from "@prisma/client"

export function nextQueryId(queries: Query[]): number {
    const set = new Set(queries.map(query => query.queryId))
    let missing = 0

    while (set.has(missing)) {
        missing++
    }

    return missing
}