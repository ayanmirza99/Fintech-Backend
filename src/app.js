import express from "express";
import cors from "cors";
import userRouter from "./routes/user.routes.js";
import fintecthRoutes from "./routes/fintechRoutes.js";
import {rateLimiter} from './middlewares/rateLimiter.js';
import {logger} from "./middlewares/logger.js";
import adminRoutes from "./routes/admin.routes.js";


const app = express();


app.use(cors("*"));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));






app.use(logger);


app.use(rateLimiter);

app.use("/api/v1/users", userRouter);

app.use("/api/v1/fintech",fintecthRoutes);

app.use("/api/admin", adminRoutes);


export { app };
