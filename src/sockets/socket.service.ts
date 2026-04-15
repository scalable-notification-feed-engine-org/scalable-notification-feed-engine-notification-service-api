import {Server} from "socket.io";
import {SocketEvents} from "../enums/socket.events";

const onlineUsers = new Map<string,string>();

export const initSocket = (io: Server) =>{
    io.on('connection', (socket) => {
        console.log("New client connected to: " + socket.id);

        socket.on(SocketEvents.JOIN, (userId:string) =>{
            onlineUsers.set(userId, socket.id);
            console.log(userId, socket.id);
        });

        socket.on('disconnect', () =>{
            onlineUsers.forEach((value, key)=>{
               if(value === socket.id){
                   onlineUsers.delete(key);
                   console.log(`User ${key} went offline.`);
               }
            });
        })
    })
}

export const sendNotificationViaSocket = (io: Server,userId:string,data:any):boolean =>{
    const socketId = onlineUsers.get(userId);
    if(socketId){
        io.to(socketId).emit(SocketEvents.SEND_NOTIFICATION, data);
        return true;
    }
    return false;
}
















