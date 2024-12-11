import express from "express";

// Custom imports
import { 
    register, 
    loginUsingEmailAndPassword,
    verifyOtp,
} from './../controllers/auth.controller';
import { catchAsync } from "./../utils";
import { authenticateToken, createTokenAndSendToken } from "./../middlewares";

const router = express.Router(); 

router.get("/", (req, res) => {
    res.send("Auth routes");
}); 

router.post("/register", catchAsync(register), catchAsync(createTokenAndSendToken)); 

router.post("/login", catchAsync(loginUsingEmailAndPassword), catchAsync(createTokenAndSendToken));

router.post('/verify-otp', catchAsync(authenticateToken), catchAsync(verifyOtp));

export default router; 