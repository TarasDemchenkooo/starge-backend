import { ConfigService } from "@nestjs/config"
import { ClientProvider, Transport } from "@nestjs/microservices"

export const buildProducerConfig = (configService: ConfigService): ClientProvider => ({
    transport: Transport.KAFKA,
    options: {
        postfixId: '',
        client: {
            clientId: `${configService.get('ASSET').toLowerCase()}-batches-validator`,
            brokers: configService.get('BROKERS').split(';')
        },
        producerOnlyMode: true,
        producer: {
            allowAutoTopicCreation: false,
        },
        send: {
            acks: 1
        }
    },
})
