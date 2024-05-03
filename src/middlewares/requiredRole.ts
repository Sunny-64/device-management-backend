import {Request, Response, NextFunction} from 'express'

// Custom imports
import { roles } from '../configs';

function requiredRole(role:string) {
    return (req:Request, res:Response, next:NextFunction) => {
        const userRole = 'userId';

        if (userRole === role) {
            next();
        } else {
            res.status(403).json({ message: 'Permission denied' });
        }
    };
}

export {
    requiredRole,
}