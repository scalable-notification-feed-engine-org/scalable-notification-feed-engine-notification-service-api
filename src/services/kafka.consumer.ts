import {Server} from "socket.io";
import {consumer} from "../config/kafka.config";
import {sendNotificationViaSocket} from "../sockets/socket.service";
import Notification from "../models/Notification";

export const startNotificationConsumer = async (io:Server) => {
    await consumer.connect();

    await consumer.subscribe({
        topic: 'activity.created',
        fromBeginning: true
    });

    await consumer.run({
        eachMessage: async ({topic, partition, message}) => {
            if (!message) return;
            console.log(`Topic: ${topic} | Partition: ${partition} | Key: ${message.key?.toString()}`);

            try {
                const rawMessage = message.value!.toString();
                const payload = JSON.parse(rawMessage);

                const activity = payload.value || payload.data || payload;

                console.log(`📩 New Activity Received: ${activity.verb} by User ${activity.actorId}`);

                const displayMessage = `${activity.actorId} ${activity.verb.toLowerCase()}ed your ${activity.objectType}`;

                const isDelivered = await sendNotificationViaSocket(io, activity.recipientId, {
                    message: displayMessage,
                    type: activity.verb,
                    objectId: activity.objectId,
                    createAt: new Date(),
                });

                const newNotification = new Notification({
                    recipientId: activity.recipientId,
                    actorId: activity.actorId,
                    type: activity.verb,
                    message: displayMessage,
                    targetId: activity.targetId,
                    isRead: false,
                    createAt: new Date(),
                })

                await newNotification.save();
                console.log(`✅ Notification stored for user: ${isDelivered}`);
            } catch (e) {
                console.error('❌ Error processing Kafka message:', e);
            }

        }
    });
}