import {Server} from "socket.io";
import {SocketEvents} from "../enums/socket.events";
import redisClient from '../config/redis.config'
import {AuthenticatedSocket, socketKeycloakMiddleware} from "../middlewares/auth.socket.middleware";


export const initSocket = (io: Server) =>{

    io.use(socketKeycloakMiddleware);

    io.on('connection', async (socket: AuthenticatedSocket) => {
        console.log("New client connected to: " + socket.userId);
        const userId = socket.userId;

        if(userId){
            await redisClient.set(`online_user:${userId}`, socket.id);

            socket.on('disconnect', async () => {
                await redisClient.del(`online_user:${userId}`);
                console.log(`👋 User ${userId} went Offline`);
            })
        }

    })
}

export const sendNotificationViaSocket = async (io: Server,userId:string,data:any):Promise<boolean> =>{
    const socketId = await redisClient.get(`online_user:${userId}`);
    if(socketId){
        io.to(socketId).emit(SocketEvents.SEND_NOTIFICATION, data);
        console.log(`⚡ Real-time notification sent to user ${userId}`);
        return true;
    }else {
        console.log(`💤 User ${userId} is offline. Saving only to DB.`);
        return false;
    }
}
















