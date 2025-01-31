import { IsPositive, IsString, Validate } from "class-validator"
import { TonAddressValidator } from "../validators/address.validator"

export class PaidRequestDto {
    @Validate(TonAddressValidator)
    address: string

    @IsPositive()
    amount: number

    @IsString()
    chargeId: string
}