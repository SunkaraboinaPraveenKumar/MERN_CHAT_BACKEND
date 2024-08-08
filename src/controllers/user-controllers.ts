import { Request, Response, NextFunction } from 'express';
import User from '../models/User.js';
import {hash,compare} from 'bcrypt'
import { createToken } from '../utils/token-manager.js';
import { COOKIE_NAME } from '../utils/constants.js';

export const getAllUsers = async (req:Request, res:Response, next:NextFunction) => {
    try {
        const users = await User.find();
        return res.status(200).json({ message: 'ok', users });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error', cause: error.message });
    }
};

export const userSignUp = async (req:Request, res:Response, next:NextFunction) => {
    try {
        //user signup
        const {name,email,password}=req.body;
        const existingUser=await User.findOne({email});
        if(existingUser){
            return res.status(401).send("User Already Exists");
        }
        const hashedPassword=await hash(password,10)
        const user = new User({name,email,password:hashedPassword})
        await user.save();
        //create token and store cookie


        res.clearCookie(COOKIE_NAME,{
            httpOnly:true,
            domain:"localhost",
            signed:true,
            path:"/"
        });

        
        const token=createToken(user._id.toString(),user.email,"7d")
        const expires=new Date();
        expires.setDate(expires.getDate()+7)
        res.cookie(COOKIE_NAME, token, {
            path: "/",
            domain: "localhost",
            expires,
            httpOnly: true,
            signed: true,
            sameSite: 'none',
            secure: true, // Ensure you use HTTPS in production
        });
        
        return res.status(201).json({ message: 'ok', name:user.name,email:user.email });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error', cause: error.message });
    }
};


export const userLogin = async (req:Request, res:Response, next:NextFunction) => {
    try {
        //user login
        const {email,password}=req.body;
        const user=await User.findOne({email});
        if(!user){
            return res.status(401).send("User Not Registered");
        }
        const isPasswordCorrect=await compare(password,user.password)
        if(!isPasswordCorrect){
            return res.status(403).send("Incorrect Password");
        }
        res.clearCookie(COOKIE_NAME,{
            httpOnly:true,
            domain:"localhost",
            signed:true,
            path:"/"
        });
        const token=createToken(user._id.toString(),user.email,"7d")
        const expires=new Date();
        expires.setDate(expires.getDate()+7)
        res.cookie(COOKIE_NAME, token, {
            path: "/",
            domain: "localhost",
            expires,
            httpOnly: true,
            signed: true,
            sameSite: 'none',
            secure: true, // Ensure you use HTTPS in production
        });
        return res.status(200).json({ message: 'ok', name:user.name,email:user.email });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error', cause: error.message });
    }
};

export const verfiyUser = async (req:Request, res:Response, next:NextFunction) => {
    try {
        //user login
        const user=await User.findById({_id:res.locals.jwtData.id});
        if(!user){
            return res.status(401).send("User Not Registered or Tokem malfunctioned!");
        }
        if(user._id.toString()!==res.locals.jwtData.id){
            return res.status(401).send("Permissions Donot Match!!");
        }
        return res.status(200).json({ message: 'ok', name:user.name,email:user.email });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error', cause: error.message });
    }
};

export const userLogout = async (req:Request, res:Response, next:NextFunction) => {
    try {
        //user login
        const user=await User.findById({_id:res.locals.jwtData.id});
        if(!user){
            return res.status(401).send("User Not Registered or Tokem malfunctioned!");
        }
        if(user._id.toString()!==res.locals.jwtData.id){
            return res.status(401).send("Permissions Donot Match!!");
        }
        res.clearCookie(COOKIE_NAME, {
            path: "/",
            domain: "localhost",
            sameSite: 'none',
            secure: true, // Ensure you use HTTPS in production
        });
        return res.status(200).json({ message: 'ok', name:user.name,email:user.email });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error', cause: error.message });
    }
};