import express from "express";

import { catchAsync } from "./../utils";
import {authenticateToken, blacklistToken, requiredRole} from "./../middlewares";
import { getAllLogins, revokeDeviceAccess } from "./../controllers/user.controller";


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

router.delete('/revoke-access/:tokenId', catchAsync(authenticateToken), catchAsync(requiredRole('user')), catchAsync(revokeDeviceAccess)); 



export default router; 