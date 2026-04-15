import express from 'express';
import {createServer} from "http";
import {Server} from 'socket.io'
import {initSocket} from "./sockets/socket.service";
import {connectRedis} from "./config/redis.config";
import {startNotificationConsumer} from "./services/kafka.consumer";

const app = express()
const httpServer = createServer(app);

const io = new Server({
    cors: {
        origin: '*'
    }
})

initSocket(io);

const startServer = async () => {
    await connectRedis();

    await startNotificationConsumer(io);

    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
        console.log(`🚀 Notification Service running on port ${PORT}`);
    });
}
startServer().catch((err) => {
    console.error(err.message)
})