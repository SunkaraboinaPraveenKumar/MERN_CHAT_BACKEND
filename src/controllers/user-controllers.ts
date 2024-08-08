import { Request, Response, NextFunction } from 'express';
import User from '../models/User.js';
import { hash, compare } from 'bcrypt';
import { createToken } from '../utils/token-manager.js';
import { COOKIE_NAME } from '../utils/constants.js';

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await User.find();
        return res.status(200).json({ message: 'ok', users });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error', cause: error.message });
    }
};

export const userSignUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(401).send("User Already Exists");
        }
        const hashedPassword = await hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        const token = createToken(user._id.toString(), user.email, "7d");
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);

        res.cookie(COOKIE_NAME, token, {
            path: "/",
            domain: "https://mern-chat-backend-5.onrender.com/", // Replace with your actual domain
            expires,
            httpOnly: true,
            signed: true,
            sameSite: 'none',
            secure: true, // Ensure you use HTTPS in production
        });

        return res.status(201).json({ message: 'ok', name: user.name, email: user.email });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error', cause: error.message });
    }
};

export const userLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send("User Not Registered");
        }
        const isPasswordCorrect = await compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(403).send("Incorrect Password");
        }

        const token = createToken(user._id.toString(), user.email, "7d");
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);

        res.cookie(COOKIE_NAME, token, {
            path: "/",
            domain: "https://mern-chat-backend-5.onrender.com/", // Replace with your actual domain
            expires,
            httpOnly: true,
            signed: true,
            sameSite: 'none',
            secure: true, // Ensure you use HTTPS in production
        });

        return res.status(200).json({ message: 'ok', name: user.name, email: user.email });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error', cause: error.message });
    }
};

export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(401).send("User Not Registered or Token malfunctioned!");
        }
        return res.status(200).json({ message: 'ok', name: user.name, email: user.email });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error', cause: error.message });
    }
};

export const userLogout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.clearCookie(COOKIE_NAME, {
            path: "/",
            domain: "https://mern-chat-backend-5.onrender.com/", // Replace with your actual domain
            sameSite: 'none',
            secure: true, // Ensure you use HTTPS in production
        });
        return res.status(200).json({ message: 'ok' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error', cause: error.message });
    }
};
