import { User } from "../models/user.model.js";
import RequestLog  from "../models/RequestLog.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// export const getAllUsers = asyncHandler(async (req, res) => {
//   const users = await User.find().select("name email role status balance");
//   res.status(200).json({ data: users, msg: "All users", error: false });
// });

export const getAllUsers = asyncHandler(async (req, res) => {
    const { page = 1, pageSize = 10 } = req.query;
  
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
  
    const total = await User.countDocuments();
    const users = await User.find()
      .select("name email role status balance")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
  
    res.status(200).json({
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: skip + limit < total,
      },
      msg: "Users fetched successfully",
      error: false,
    });
  });
  

export const cancelUserSubscription = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const user = await User.findById(userId);

  if (!user) throw new ApiError(404, "User not found");

  user.subscription = null;
  user.status = "inactive";
  await user.save();

  res.status(200).json({ msg: "Subscription cancelled", error: false });
});

// export const getLogs = asyncHandler(async (req, res) => {
//   const logs = await RequestLog.find().sort({ timestamp: -1 }).limit(100);
//   res.status(200).json({ data: logs, msg: "Logs fetched", error: false });
// });

export const getLogs = asyncHandler(async (req, res) => {
    const { page = 1, pageSize = 10 } = req.query;
  
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);
  
    const total = await RequestLog.countDocuments();
    const logs = await RequestLog.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);
  
    res.status(200).json({
      data: logs,
      pagination: {
        total,
        page: parseInt(page),
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: skip + limit < total,
      },
      msg: "Logs fetched successfully",
      error: false,
    });
  });
  