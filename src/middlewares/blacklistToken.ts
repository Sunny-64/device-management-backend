import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

import { IAuth, ICustomRequest } from "./../types";
import { BlacklistToken as Blacklist, ActivityLog } from "./../models";
import { ApiError } from "./../utils";
import { emitSocketEvent } from "./../sockets";
import { socketEvents } from "./../configs";

async function blacklistToken(
    req: ICustomRequest,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers["authorization"];

    const bearer = authHeader && authHeader.split(" ")[0];
    if (bearer != "Bearer") return res.sendStatus(401);

    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) return res.sendStatus(401);

    const isTokenBlacklisted = await Blacklist.findOne({ token: token });

    if (isTokenBlacklisted) {
        jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET!,
            async (err, payload: IAuth | any) => {
                if(err) throw new ApiError('Invalid token', 400); 
                const activity = await ActivityLog.findOne({
                    user_id: payload.id,
                    token_id: payload.tokenId,
                });
                if (!activity) {
                    throw new ApiError("Activity not found", 404);
                }
                activity.logged_out = true;
                activity.logged_out_at = Date.now(); 
                activity.token_deleted = true;
                await activity.save();
                emitSocketEvent(req, payload.id, socketEvents.DEVICE_LOGGED_OUT, '');
            }
        );
        const responseJson = {
            Status: "Failure",
            Details: "Token blacklisted. Cannot use this token.",
        };


        return res.status(401).json(responseJson);
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, async (err, payload:IAuth | any) => {
        if (err) {
            throw new ApiError('Unauthorized', 401); 
        }

        if (payload) {
            const activity = await ActivityLog.findOne({
               user_id: payload.id, 
               token_id: payload.tokenId ,
            });

            if(!activity){
                throw new ApiError('Activity not found', 404); 
            }

            if (activity.token_deleted) {

                activity.logged_out = true;
                activity.logged_out_at = Date.now(); 

                await activity.save();
                const blacklist_token = new Blacklist({
                    token: token,
                });
                await blacklist_token.save();
            } else {
                activity.logged_out = true;
                activity.token_deleted = true;
                activity.logged_out_at = Date.now(); 
                
                await activity.save();
                const blacklist_token = new Blacklist({
                    token: token,
                });
                await blacklist_token.save();
            }

            emitSocketEvent(req, payload.id, socketEvents.DEVICE_LOGGED_OUT, ''); 
        }
        next();
    });
}

export default blacklistToken;
