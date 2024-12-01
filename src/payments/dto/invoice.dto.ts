import { Symbol } from "@prisma/client"
import { IsEnum, IsNumber, IsString, Max } from "class-validator"

export class InvoiceDto {
    @IsString()
    address: string

    @IsNumber()
    @Max(50000)
    source: number

    @IsNumber()
    target: number

    @IsEnum(Symbol)
    route: Symbol
}