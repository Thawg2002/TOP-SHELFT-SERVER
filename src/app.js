import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { connectDB } from "./config/db";
import authRouter from "./routers/auth";
import cartRouter from "./routers/cart";
import categoryRouter from "./routers/category";
import productRouter from "./routers/product";
import logingoogle from "./routers/logingoogle";
const app = express();
dotenv.config();
// middleware
app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));

// connect db
connectDB(process.env.DB_URI);

// routers
app.use("/api/v1", productRouter);
app.use("/api/v1", authRouter);
app.use("/api/v1", categoryRouter);
app.use("/api/v1", cartRouter);
// app.use("/api/v1", orderRouter);
app.use("/api/v1", logingoogle);

export const viteNodeApp = app;
