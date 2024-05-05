import { Response } from "express";
import ShortUniqueId from "short-unique-id";
import jwt from "jsonwebtoken";
import { ICustomRequest } from "./../types";
import { ActivityLog } from "./../models";

export const createTokenAndSendToken = async (req: ICustomRequest, res:Response) => {
    // unique token id
    const tokenId = req.auth.id + Date.now() + Math.random().toString(36).substring(2);

    // user's ip address
    let ip = req.ip;  

    const userActivity = await ActivityLog.find({user_id: req.auth.id , token_deleted:false, ip_address:ip, device: req.headers["user-agent"]});
    userActivity.forEach(async(activity) => {
      if(activity){
        activity.token_deleted=true;
        await activity.save()
      }      
    });

    const token = new ActivityLog({
        user_id : req.auth.id,
        token_id : tokenId,
        ip_address : ip ,
        device : req.headers["user-agent"]
    });

    await token.save();

    const tokenUser = { id:req.auth.id , tokenId: tokenId  };
    const accessToken = jwt.sign(tokenUser, process.env.ACCESS_TOKEN_SECRET!);
    return res.status(200).json({
        success : 'ok',
        message : 'user found and logged in', 
        token : accessToken,
    }); 
};

