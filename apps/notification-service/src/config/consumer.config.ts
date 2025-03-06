import { KafkaOptions, Transport } from "@nestjs/microservices"

export const ConsumerConfig: KafkaOptions = {
    transport: Transport.KAFKA,
    options: {
        postfixId: '',
        client: {
            clientId: 'notification-service',
            brokers: process.env.BROKERS.split(';')
        },
        consumer: {
            groupId: 'notification-service-group',
            allowAutoTopicCreation: false,
            sessionTimeout: 60000
        }
    }
}
