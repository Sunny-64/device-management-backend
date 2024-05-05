import { Request } from "express"
export interface IUser {
    _id : string;
    username : string; 
    email : string; 
    password : string;  
    isEmailVerified : boolean;
    role : string; 
    status : boolean; 
    createdAt : string
    updatedAt : string
}

export interface IAuth {
    id : string;
    register ?: boolean; 
    tokenId ?: string;
}

export interface ICustomRequest extends Request {
    token : string;
    user : IUser;
    auth : IAuth;
}