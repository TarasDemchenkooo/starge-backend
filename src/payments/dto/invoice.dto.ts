import { Symbol } from "@prisma/client"
import { IsEnum, IsNumber, IsString } from "class-validator"

export class InvoiceDto {
    @IsString()
    address: string

    @IsNumber()
    source: number

    @IsNumber()
    target: number

    @IsEnum(Symbol)
    route: Symbol
}