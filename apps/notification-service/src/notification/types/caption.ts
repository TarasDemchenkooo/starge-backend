import { Symbol } from "@prisma/client"

export type Caption = {
    address: string
    amount: number
    route: Symbol
    success: boolean
}
