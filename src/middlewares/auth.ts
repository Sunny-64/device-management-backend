import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { IAuth, ICustomRequest } from "./../types";
import { ActivityLog, BlacklistToken as Blacklist } from "./../models";

//MIDDLEWARE TO AUTHENTICTAE TOKEN BEFORE ACCESSING PROTECTED ROUTES
async function authenticateToken(
    req: ICustomRequest,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers["authorization"];

    const bearer = authHeader && authHeader.split(" ")[0];
    if (bearer != "Bearer") return res.status(401).json({
        message : 'Unauthorized'
    });

    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) return res.status(401).json({
        message : 'Unauthorized'
    });

    const isTokenBlacklisted = await Blacklist.findOne({ token: token });
    if (isTokenBlacklisted) {
        return res.status(401).json({
            success: "failed",
            message: "token blacklisted cannot use this token",
        });
    }

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!,
        async (err, payload: IAuth | any) => {
            if (err) {
                return res.status(403).json({
                    message: "unauthorized",
                    error: err,
                });
            }

            const login = await ActivityLog.findOne({
                user_id: payload.id,
                token_id: payload.tokenId,
            });

            if (login?.token_deleted == true) {
                const blacklistToken = new Blacklist({
                    token: token,
                });

                await blacklistToken.save();
                return res.status(401).json({
                    message : 'token is blacklisted'
                });
            }

            req.auth = payload;
            next();
        }
    );
}

export default authenticateToken;
