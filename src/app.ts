import express from "express";
import cors from 'cors'
// import { seed } from "./seed";
import {createServer} from 'http';
import { Server } from "socket.io";
import morgan from 'morgan'; 
import helmet from "helmet";
import path from 'path'; 

// Custom Imports
import { initializeSocket } from "./sockets";
import { 
    errorHandler,
 } from './middlewares/'; 
import { authRoutes, userRoutes } from "./routes";

const app = express();

const httpServer = createServer(app); 

const io = new Server(httpServer, {
    cors : {
        origin : "*"
    }
}); 

app.set("io", io); 
app.use(morgan('dev')); 
app.use(helmet()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin : "*", 
})); 

app.get("/", (req, res) => {
    res.status(200).json({
        success : true, 
        message : "Welcome"
    });
});

app.use('/auth', authRoutes); 
app.use('/user', userRoutes);

app.get("*", (req, res) => {
    res.status(404).json({
        success : false, 
        message : "Route not found"
    })
}); 

app.use(errorHandler); 

export {
    httpServer,
}