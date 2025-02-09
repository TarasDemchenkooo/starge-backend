import { ConfigService } from "@nestjs/config"
import { ClientProvider, Transport } from "@nestjs/microservices"

export const buildProducerConfig = (configService: ConfigService): ClientProvider => ({
    transport: Transport.KAFKA,
    options: {
        postfixId: '',
        client: {
            clientId: 'batches-emitter',
            brokers: configService.get('BROKERS').split(';')
        },
        producerOnlyMode: true,
        producer: {
            allowAutoTopicCreation: false,
            idempotent: true
        },
        send: {
            acks: -1
        }
    },
})