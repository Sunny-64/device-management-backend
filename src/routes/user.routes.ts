import express from "express";

import { catchAsync } from "./../utils";
import {authenticateToken, blacklistToken, requiredRole} from "./../middlewares";
import { getAllLogins } from "./../controllers/user.controller";


const router = express.Router(); 

router.get("/", (req, res) => {
    res.send("user routes");
}); 


router.delete("/logout", catchAsync(blacklistToken), (req, res) => {
    return res.status(200).json({
        success : 'ok', 
        message : 'user logged out',
    }); 
}); 

router.get('/active-devices', catchAsync(authenticateToken), catchAsync(requiredRole('user')), catchAsync(getAllLogins));



export default router; 