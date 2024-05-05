
import { Server, Socket } from "socket.io";
import jwt, { JwtPayload } from 'jsonwebtoken'

// Custom imports
import { ApiError } from "./../utils";
import {User} from './../models'; 
import { IAuth, ICustomRequest } from "./../types";

const initializeSocket = (io: Server) => {
    io.on("connection", async (socket: Socket) => {
        try {
            const authToken: string = socket.handshake.auth.token || socket.handshake.headers.authorization;
            if(!authToken) throw new ApiError('Unauthorized', 401); 
            const decodedToken:IAuth | JwtPayload | any = jwt.verify(authToken, process.env.ACCESS_TOKEN_SECRET!);
          
            socket.join(decodedToken?.id); 
            socket.emit('connected', decodedToken?.id); 


            socket.on("disconnect", () => {
                console.log("User disconnected!!!");
            })
        }
        catch (err) {
            console.log(err);
        }
    })
}

const emitSocketEvent = (req : ICustomRequest, roomId : string, event : string, payload : any) => {
    try{
        const io = req.app.get('io'); 
        io.to(roomId).emit(event, payload); 
    }
    catch(err){
        console.log(err); 
        throw new ApiError("Internal server error", 500);
    }
}

export {
    initializeSocket,
    emitSocketEvent,
}; 