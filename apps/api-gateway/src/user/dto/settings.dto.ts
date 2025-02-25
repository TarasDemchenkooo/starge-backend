import { Symbol } from "@prisma/client"
import { IsBoolean, IsEnum, IsOptional } from "class-validator"

export class UpdateSettingsDto {
    @IsOptional()
    @IsEnum(Symbol)
    tokenSymbol?: Symbol

    @IsOptional()
    @IsBoolean()
    vibration?: boolean

    @IsOptional()
    @IsBoolean()
    notifications?: boolean
}