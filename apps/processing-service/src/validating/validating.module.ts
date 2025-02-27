import { Module } from "@nestjs/common"
import { ValidatingService } from "./validating.service"
import { ClientsModule } from "@nestjs/microservices"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { buildProducerConfig } from "../config/kafka/producer.config"

@Module({
    imports: [
        ClientsModule.registerAsync([{
            name: 'BATCHES_VALIDATOR',
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: buildProducerConfig
        }])
    ],
    providers: [ValidatingService]
})

export class ValidatingModule { }
