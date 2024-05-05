import { Response } from "express";
import { ActivityLog, User } from "./../models";
import { ICustomRequest } from "./../types";
import { ApiError } from "./../utils";
import { emitSocketEvent } from "./../sockets";
import { socketEvents } from "./../configs";

export const getAllLogins = async (req:ICustomRequest,res:Response)=>{
 
    const user = await User.findOne({ _id: req.auth.id });
    if (!user){
        return res.status(404).json({
            success : 'failed', 
            message : 'user not found',
        }); 
    }
    const userActivity:any = await ActivityLog.find({user_id: user._id, token_deleted : false});
    const userActivityJson = userActivity?.map((activity:any) => activity.toJSON()); 

    userActivityJson.forEach((activity:any) => { 
        if(activity.token_id === req.auth.tokenId){
            activity.current = true; 
        }
        else{
            activity.current = false; 
        }
    }); 

    res.status(200).json({
        success : 'ok', 
        message : 'Fetched all Active Devices', 
        data : userActivityJson
    }); 
}

export const revokeDeviceAccess = async (req:ICustomRequest, res:Response) => {
    const {tokenId} = req.params 

    const doesActivityWithTokenExist = await ActivityLog.findOne({token_id : tokenId}); 

    if(!doesActivityWithTokenExist) {
        return res.status(400).json({
            success : 'failed', 
            message : `User with ${tokenId} not found`,
        }); 
    }

    if(tokenId === req.auth.tokenId) throw new ApiError('Cannot revoke the current device please use logout', 400); 

    doesActivityWithTokenExist.token_deleted = true; 
    doesActivityWithTokenExist.logged_out_at = Date.now(); 
    const saveResult = await doesActivityWithTokenExist.save();

    emitSocketEvent(req, req.auth.id, socketEvents.DEVICE_LOGGED_OUT, saveResult); 

    return res.status(200).json({
        success : 'ok',
        message : 'access revoked successfully', 
    });
}