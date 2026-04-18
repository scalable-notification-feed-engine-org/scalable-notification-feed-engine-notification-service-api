import express from 'express';
import {createServer} from "http";
import {Server} from 'socket.io';
import cors from 'cors';
import notificationRoutes from './routes/notification.routes';
import {initSocket} from "./sockets/socket.service";
import redisClient, {connectRedis} from "./config/redis.config";
import {startNotificationConsumer} from "./services/kafka.consumer";
import 'dotenv/config'
import mongoose from "mongoose";
import * as process from "node:process";
import {createAdapter} from "@socket.io/redis-adapter";

const app = express()
app.use(cors());
app.use(express.json());

app.use('/api/notifications', notificationRoutes);

const httpServer = createServer(app);

const io = new Server(httpServer,{
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true
    }
})

initSocket(io);



const startServer = async () => {
    try {
        await connectRedis();

      const subClient = redisClient.duplicate();
        await subClient.connect();
        io.adapter(createAdapter(redisClient, subClient));
        console.log(" Socket.io Redis Adapter Connected");

        const PORT = process.env.PORT || 5000;
        httpServer.listen(PORT, () => {
            console.log(`🚀 Notification Service running on port ${PORT}`);
        });

         startNotificationConsumer(io).catch(err => {
             console.error(" Kafka Consumer Failed to Start:", err);
         });
    }catch (err) {
        // @ts-ignore
        console.error("Critical Server Error:", err.message);
        process.exit(1);
    }
}

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI!);
        console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
        console.error(` Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();

startServer().catch((err) => {
    console.error(err.message)
})