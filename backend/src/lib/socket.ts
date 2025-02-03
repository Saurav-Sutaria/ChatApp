import { Server } from "socket.io";
import express from 'express';
import http from 'http';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors:{
        origin : 'http://localhost:5173',
    }
});

//map to store {userId:socketId}
const userSocketMap : Map<string,string> = new Map();

const getSocketIdOfReceiver = (receiverId : string) : string | null => {
    return userSocketMap.get(receiverId) || null;
}

io.on('connection', (socket) => {
    console.log('user connected', socket.id);

    const userId : string | null = socket.handshake.query?.userId as string;
    if(userId){
        userSocketMap.set(userId,socket.id);  
    }
    //io.emit will send to all connected clients
    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
    
    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id);
        userSocketMap.forEach((value,key) => {
            if(value === socket.id){
                userSocketMap.delete(key);
            }
        });
    });
});

export { io, server, app, getSocketIdOfReceiver };