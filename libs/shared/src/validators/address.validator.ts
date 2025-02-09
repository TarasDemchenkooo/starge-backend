import { Address } from "@ton/core"
import { ValidatorConstraint, ValidatorConstraintInterface } from "class-validator"

@ValidatorConstraint({ name: 'TON Address Validator', async: false })
export class TonAddressValidator implements ValidatorConstraintInterface {
    validate(address: string): boolean {
        try {
            Address.parse(address)

            //if (address[0] === 'k' || address[0] === '0') {
            //    throw new Error('Testnet addresses is not supported')
            //}

            return true
        } catch {
            return false
        }
    }

    defaultMessage(): string {
        return 'TON address is not valid'
    }
}