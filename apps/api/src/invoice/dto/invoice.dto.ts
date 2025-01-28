import { Symbol } from "@prisma/client"
import { IsEnum, IsPositive, Max, Validate } from "class-validator"
import { TonAddressValidator } from "libs/validators/address.validator"

export class InvoiceDto {
    @Validate(TonAddressValidator)
    address: string

    @IsPositive()
    @Max(50000)
    source: number

    @IsPositive()
    target: number

    @IsEnum(Symbol)
    route: Symbol
}