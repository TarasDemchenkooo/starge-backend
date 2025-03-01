import { Module } from "@nestjs/common"
import { ValidatingService } from "./validating.service"
import { BlockchainModule } from "../blockchain/blockchain.module"

@Module({
    imports: [BlockchainModule],
    providers: [ValidatingService]
})

export class ValidatingModule { }
