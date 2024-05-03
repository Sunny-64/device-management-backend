
import { Server, Socket } from "socket.io";

// Custom imports
import { ApiError } from "./../utils";

const initializeSocket = (io: Server) => {
    io.on("connection", async (socket: Socket) => {
        try {
            // socket.join(decodedToken._id);
            // socket.emit("connected", decodedToken._id); 

            socket.on("disconnect", () => {
                console.log("User disconnected!!!");
            })
        }
        catch (err) {
            console.log(err);
        }
    })
}


export {
    initializeSocket,
}; 