import express from "express";
import cors from 'cors';
import { config } from 'dotenv';
import morgan from 'morgan';
import appRouter from "./Routes/index.js";
import cookieParser from "cookie-parser";

config();

const app = express();

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://front-end-mern-chat-bot.vercel.app",
        "https://front-end-mern-chat-bot-prw2.vercel.app",
        "https://menr-chat-fr-ont.vercel.app"
    ],
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use("/api/v1", appRouter);

export default app;
