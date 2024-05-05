import { Response, Request, NextFunction } from "express"
import bcrypt from 'bcryptjs'

// Custom Imports
import { User, Otp } from "./../models";
import { ApiError } from "./../utils";

import { sendOtp } from "./../services";
import { otpTypes } from "./../configs";
import { ICustomRequest, IUser } from "./../types";
import { validateEmail } from "./../validations";


/**
 * @description checks if the email entered is valid and authenticates the user 
 * @param username 
 * @param email 
 * @param password 
 */

export const register = async (req: ICustomRequest, res: Response, next : NextFunction) => {
    const {
        username,
        email,
        password,
    } = req.body;

    if(!validateEmail(email)) throw new ApiError("Invalid Email address", 400);

    const checkIfUserExist = await User.findOne({ username, email });

    if (checkIfUserExist) throw new ApiError('User is already Registered', 400);

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = new User({
        username,
        email,
        password: hashedPassword,
    });

    const saveUser:IUser | any = await newUser.save();

    req.user = saveUser; 
    req.auth = {
        id : req.user._id, 
        register : true,
    }
    
    next(); 
}

/**
 * @description checks if the email entered is valid and authenticates the user 
 * @param email 
 * @param password 
 */

export const loginUsingEmailAndPassword = async (req: ICustomRequest, res: Response, next : NextFunction) => {
    const { username, email, password } = req.body;
    if(!(username || email && password)) {
        throw new ApiError('Invalid inputs', 400); 
    }

    let doesUserExist: IUser | null | undefined;
    if(username){
        doesUserExist = await User.findOne({username}); 
    }
    if(email){
        doesUserExist = await User.findOne({email}); 
    }
    if (!doesUserExist) throw new ApiError("User not Found", 404);
    if (!bcrypt.compareSync(password, doesUserExist?.password as string)) throw new ApiError("wrong email or Password", 400); 
    req.user = doesUserExist; 
    req.auth = {
        id : req.user._id, 
    }
    next();
}


