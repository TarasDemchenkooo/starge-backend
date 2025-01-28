import { IsPositive, IsString, Validate } from "class-validator"
import { TonAddressValidator } from "libs/validators/address.validator"

export class WithdrawalRequestDto {
    @Validate(TonAddressValidator)
    address: string

    @IsPositive()
    amount: number

    @IsString()
    chargeId: string
}