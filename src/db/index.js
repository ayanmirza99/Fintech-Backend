import mongoose from "mongoose";
import { DB_NAME } from "../constants/index.js";

export const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_DB_URI}/${DB_NAME}`
      
      
    );
    console.log("Db connected");
  } catch (error) {
    console.log("DB connection error: ", error);
    process.exit(1);
  }
};
