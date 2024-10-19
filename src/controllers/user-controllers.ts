import { Request, Response, NextFunction } from 'express';
import User from '../models/User.js';
import { hash, compare } from 'bcrypt';
import { createToken } from '../utils/token-manager.js';
import { COOKIE_NAME } from '../utils/constants.js';

// Helper function to dynamically determine the domain
const getDomain = (req: Request): string => {
    const host = req.hostname; // Alternatively, use req.headers.host
    if (host.includes('localhost')) {
        return 'localhost';
    } else if (host.includes('mern-chat-backend-5.onrender.com')) {
        return 'mern-chat-backend-5.onrender.com';
    } else if (host.includes('mern-chat-backend-delta.vercel.app')) { // Add more domains here
        return 'mern-chat-backend-delta.vercel.app';
    }
    return host; // Default to the host if nothing matches
};

// Get all users
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await User.find();
        return res.status(200).json({ message: 'ok', users });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error', cause: error.message });
    }
};

// User signup
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

        const domain = getDomain(req); // Dynamically get the domain

        res.cookie(COOKIE_NAME, token, {
            path: "/",
            domain, // Use dynamic domain
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

// User login
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

        const domain = getDomain(req); // Dynamically get the domain

        res.cookie(COOKIE_NAME, token, {
            path: "/",
            domain, // Use dynamic domain
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

// Verify user from token
export const verfiyUser = async (req: Request, res: Response, next: NextFunction) => {
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

// User logout
export const userLogout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const domain = getDomain(req); // Dynamically get the domain

        res.clearCookie(COOKIE_NAME, {
            path: "/",
            domain, // Use dynamic domain
            sameSite: 'none',
            secure: true, // Ensure you use HTTPS in production
        });

        return res.status(200).json({ message: 'ok' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error', cause: error.message });
    }
};
