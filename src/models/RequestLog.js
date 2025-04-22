
import mongoose from "mongoose";

const requestLogSchema = new mongoose.Schema({
  timestamp: Date,
  method: String,
  endpoint: String,
  status: Number,
  userId: String,
  ip: String,
  userAgent: String,
  duration: String,
});

const RequestLog = mongoose.model("RequestLog", requestLogSchema);
export default RequestLog;
