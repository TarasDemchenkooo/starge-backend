import { ProducerConfig } from "kafkajs"

export const producerConfig: ProducerConfig = {
    allowAutoTopicCreation: false,
    retry: {
        retries: 5,
        multiplier: 2,
        initialRetryTime: 300,
        maxRetryTime: 15000,
        factor: 0.2
    }
}
