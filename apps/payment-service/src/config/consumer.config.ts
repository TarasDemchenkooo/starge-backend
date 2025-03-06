import { ConsumerConfig } from "kafkajs"

export const consumerConfig: ConsumerConfig = {
    groupId: 'refund-service-group',
    allowAutoTopicCreation: false,
    sessionTimeout: 60000
}
