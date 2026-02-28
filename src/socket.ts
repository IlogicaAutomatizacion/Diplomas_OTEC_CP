import { io, Socket } from "socket.io-client";
import { backend } from "./vars";

export const socket: Socket = io(backend, {
    transports: ["websocket"], 
    
    autoConnect: false,        
});
