import express from "express";

// Custom imports
import { 
    register, 
    loginUsingEmailAndPassword,
} from './../controllers/auth.controller';
import { catchAsync } from "./../utils";
import { createTokenAndSendToken } from "./../middlewares";

const router = express.Router(); 

router.get("/", (req, res) => {
    res.send("Auth routes");
}); 

router.post("/register", catchAsync(register), catchAsync(createTokenAndSendToken)); 

router.post("/login", catchAsync(loginUsingEmailAndPassword), catchAsync(createTokenAndSendToken));

export default router; 