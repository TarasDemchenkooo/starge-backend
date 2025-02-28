import { KafkaOptions, Transport } from "@nestjs/microservices"

export const ConsumerConfig: KafkaOptions = {
    transport: Transport.KAFKA,
    options: {
        postfixId: '',
        client: {
            clientId: `${process.env.ASSET.toLowerCase()}-processor`,
            brokers: process.env.BROKERS.split(';')
        },
        consumer: {
            groupId: `${process.env.ASSET.toLowerCase()}-processing-group`,
            allowAutoTopicCreation: false,
            sessionTimeout: 60000
        }
    }
}
