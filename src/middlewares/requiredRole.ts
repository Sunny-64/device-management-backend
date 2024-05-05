import {Request, Response, NextFunction} from 'express'

// Custom imports
import { roles } from '../configs';
import { ICustomRequest } from './../types';
import { User } from './../models';
import { ApiError } from './../utils';

function requiredRole(role:string) {
    return async (req:ICustomRequest, res:Response, next:NextFunction) => {
        const userId = req.auth.id;
        const user = await User.findById(userId); 
        if(!user){
            throw new ApiError('User not found', 404); 
        }
        if (user.role === role) {
            next();
        } else {
            res.status(403).json({ message: 'Permission denied' });
        }
    };
}

export {
    requiredRole,
}