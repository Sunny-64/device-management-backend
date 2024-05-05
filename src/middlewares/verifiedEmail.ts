import { Response, NextFunction } from "express";
import { ICustomRequest } from "./../types";
import { ApiError } from "./../utils";
import { User } from "./../models";

export const verifiedEmailRequired = async (req: ICustomRequest, res: Response, next: NextFunction) => {
    const userId = req.auth.id; 
    const user = await User.findById(userId); 
    if(!user){
        throw new ApiError('User not found', 404); 
    }
    if(!user.isEmailVerified) throw new ApiError("Unauthorized Please verify the email first", 401); 
    next(); 
}