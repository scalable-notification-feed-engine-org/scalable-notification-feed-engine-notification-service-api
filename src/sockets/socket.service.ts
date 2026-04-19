import { Server, Socket } from "socket.io";
import redisClient from '../config/redis.config';

let globalIo: Server;

export const initSocket = (io: Server) => {
    globalIo = io;

    //  io.use(socketKeycloakMiddleware);

    console.log("📡 Socket Server Initialized and Waiting...");

    io.on('connection', (socket: Socket) => {
        console.log(`New Connection: ${socket.id}`);

        socket.on("join", async (userId: string) => {
            if (!userId) {
                console.error(" Join failed: No userId provided");
                return;
            }

            const cleanUserId = userId.trim();

            (socket as any).userId = cleanUserId;

            await socket.join(cleanUserId);
            console.log(`🏠 User [${cleanUserId}] successfully joined their private room.`);

            globalIo.emit("user_status_changed" , {
                userId: cleanUserId,
                status: "online"
            })

            try {
                await redisClient.set(`online_user:${cleanUserId}`, "true");
                const verify = await redisClient.get(`online_user:${cleanUserId}`);
                console.log(` Redis Status for ${cleanUserId}: ${verify ? 'ONLINE' : 'FAILED'}`);
            } catch (err) {
                console.error(" Redis Set Error:", err);
            }

            const isActive = io.sockets.adapter.rooms.has(cleanUserId);
            console.log(` Room [${cleanUserId}] Active Status: ${isActive}`);
        });

        socket.on('disconnect', async () => {
            const userId = (socket as any).userId;
            const sockets = await globalIo.in(userId).fetchSockets();

           if(sockets.length === 0 ) {
               globalIo.emit("user_status_changed" , {
                   userId: userId,
                   status: "offline"
               })
               await redisClient.del(`online_user:${userId}`);
           }else {
               console.log(` User ${userId} still has ${sockets.length} device(s) online`);
           }

        });
    });
};

export const sendNotificationViaSocket = async (userId: string, data: any): Promise<boolean> => {
    if (!globalIo) return false;

    const cleanId = userId.trim();
    const sockets = await globalIo.in(cleanId).fetchSockets();

    if (sockets.length > 0) {
        globalIo.to(cleanId).emit("notification", data);
        console.log(` Delivered to ${cleanId}`);
        return true;
    }

    console.log(` User ${cleanId} is offline (No sockets in room)`);
    return false;
};