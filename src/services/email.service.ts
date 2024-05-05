import nodemailer from "nodemailer";
import dotenv from "dotenv";

import { Otp as OtpModel, User } from "./../models";
import { ApiError } from "./../utils";
import SMTPTransport from "nodemailer/lib/smtp-transport";
dotenv.config();

const transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo> =
    nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });

export const sendOtp = async (userId: string, otpType: string) => {
    const OTP: number = Math.floor(Math.random() * 90000 + 10000);
    try {
        const user = await User.findById(userId);
        if (!user) throw new ApiError("Invalid UserId in register", 500);
        const mailOptions = {
            from: process.env.GMAIL_USER, // sender address
            to: user?.email as string, // receiver
            subject: "Verify Email", // Subject line
            html: `Dear user,
      To verify your email, enter this OTP: ${OTP}. This OTP is only valid for 5 minutes.
      If you did not create an account, then ignore this email.`,
        };
        const info = await transporter.sendMail(mailOptions);

        const otpObj = new OtpModel({
            userId: user._id,
            otp: OTP,
            otpType,
        });
        await otpObj.save();
        console.log("otp saved");
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
};
