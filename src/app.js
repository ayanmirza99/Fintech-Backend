import express from "express";
import cors from "cors";

const app = express();

app.use(
  cors("*")
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

// import routes
import userRouter from "./routes/user.routes.js";
import fintecthRoutes from "./routes/fintechRoutes.js";


// rouyes declaration
app.use("/api/v1/users", userRouter);

app.use("/api/v1/fintech", fintecthRoutes);


export { app };
