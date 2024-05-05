import { Response } from "express";
import { ActivityLog, User } from "./../models";
import { ICustomRequest } from "./../types";

export const getAllLogins = async (req:ICustomRequest,res:Response)=>{
 
    const user = await User.findOne({ _id: req.auth.id });
    if (!user){
        return res.status(404).json({
            success : 'failed', 
            message : 'user not found',
        }); 
    }
    const userActivity = await ActivityLog.find({user_id: user._id, token_deleted : false});
    res.status(200).json({
        success : 'ok', 
        message : 'Fetched all Active Devices', 
        data : userActivity
    }); 
}

