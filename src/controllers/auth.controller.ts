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
    
    sendOtp(saveUser._id, otpTypes.VERIFY_EMAIL);
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
    sendOtp(req.user._id, otpTypes.TWO_FACTOR_AUTH); 
    next();
}


export const verifyEmail = async (req: ICustomRequest, res: Response) => {
    const { otp } = req.body;

    const userId = req.auth.id;

    if (!otp) throw new ApiError("Invalid Otp", 400);

    const fetchOtp = await Otp.findOne({ userId: userId }).sort({ createdAt: -1 });

    if (!fetchOtp || fetchOtp.isVerified) throw new ApiError("OTP expired", 400); 

    if (fetchOtp.otp !== otp || fetchOtp.otpType !== otpTypes.VERIFY_EMAIL) throw new ApiError("Invalid Request or OTP", 400); 
    
    // otp matched so find user and mark email verified true
    const fetchUser = await User.findById(userId);

    if (!fetchUser) throw new ApiError("User not found", 404); 

    fetchUser.isEmailVerified = true;
    fetchOtp.isVerified = true;
    
    await fetchOtp.save(); 
    await fetchUser.save(); 
    return res.status(200).json({ message: "Email verified" });
}

/**
 * @description : Verifies Otp by checking if a user is valid and confirms the otp verification success
 * @param Otp 
 */
export const verifyOtp = async (req:ICustomRequest, res:Response) => {
    const {otp} = req.body; 
    const userId = req.auth.id; 

    const checkUser = await User.findById(userId); 

    if(!checkUser) throw new ApiError("User not Found", 404); 

    const checkOtp = await Otp.findOne({userId}).sort({createdAt : -1}); 

    if(!checkOtp || checkOtp.isVerified) return res.status(400).json({message : "Otp expired"}); 

    if(checkOtp.otpType !== otpTypes.RESET_PASSWORD ||otp !== checkOtp.otp) throw new ApiError("OTP did not match", 400); 

    checkOtp.isVerified = true; 
    await checkOtp.save(); 
    return res.status(200).json({message : "Otp verified successfully"}); 
}