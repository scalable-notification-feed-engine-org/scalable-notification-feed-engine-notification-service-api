import { Kafka, logLevel } from "kafkajs";

export const kafka = new Kafka({
    clientId: 'notification-service-api',
    brokers: ['localhost:9092'],
    logLevel: logLevel.ERROR
});

export const consumer = kafka.consumer({
    groupId: 'notification-service-group'
})