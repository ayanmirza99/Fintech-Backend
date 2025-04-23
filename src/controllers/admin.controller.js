import { User } from "../models/user.model.js";
import RequestLog from "../models/RequestLog.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import dayjs from "dayjs";

// export const getAllUsers = asyncHandler(async (req, res) => {
//   const users = await User.find().select("name email role status balance");
//   res.status(200).json({ data: users, message: "All users", error: false });
// });

export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, pageSize = 10 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(pageSize);
  const limit = parseInt(pageSize);

  const total = await User.countDocuments();
  const users = await User.find()
    .select("fullName email role status balance subscription")
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
    message: "Users fetched successfully",
    error: false,
  });
});

export const cancelUserSubscription = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const user = await User.findById(userId);

  if (!user) throw new ApiError(404, "User not found");

  user.subscription.packageName = null;
  user.subscription.status = "inactive";
  user.subscription.currentPeriodEnd = null;
  await user.save();

  res.status(200).json({ message: "Subscription cancelled", error: false });
});

// export const getLogs = asyncHandler(async (req, res) => {
//   const logs = await RequestLog.find().sort({ timestamp: -1 }).limit(100);
//   res.status(200).json({ data: logs, message: "Logs fetched", error: false });
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
    message: "Logs fetched successfully",
    error: false,
  });
});

export const getRecentSignups = asyncHandler(async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = dayjs()
      .subtract(days - 1, "day")
      .startOf("day")
      .toDate();

    const signups = await RequestLog.aggregate([
      {
        $match: {
          method: "POST",
          endpoint: "/api/v1/users/register", // change if different
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Ensure all days are included (even with 0)
    const labels = [];
    const data = [];

    for (let i = 0; i < days; i++) {
      const day = dayjs()
        .subtract(days - 1 - i, "day")
        .format("YYYY-MM-DD");
      labels.push(day);
      const found = signups.find((s) => s._id === day);
      data.push(found ? found.count : 0);
    }

    res.json({ labels, data });
  } catch (err) {
    console.error("Signup analytics error:", err);
    res.status(500).json({ error: "Failed to fetch signup analytics" });
  }
});

export const getSubscriptionAnalytics = asyncHandler(async (req, res) => {
  try {
    // Get subscription status (active vs inactive)
    const statusData = await User.aggregate([
      {
        $group: {
          _id: "$subscription.status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get subscription duration (monthly vs yearly)
    const durationData = await User.aggregate([
      {
        $group: {
          _id: "$subscription.packageName",
          count: { $sum: 1 },
        },
      },
    ]);

    // Format data to match front-end expectations
    const statusLabels = ["Active", "Inactive"];
    const statusCounts = [0, 0]; // In case there are no active/inactive users, we ensure zero data.

    statusData.forEach((data) => {
      if (data._id === "active") statusCounts[0] = data.count;
      if (data._id === "inactive") statusCounts[1] = data.count;
    });

    const durationLabels = ["Monthly", "Yearly"];
    const durationCounts = [0, 0];

    durationData.forEach((data) => {
      if (data._id === "monthly") durationCounts[0] = data.count;
      if (data._id === "yearly") durationCounts[1] = data.count;
    });

    res.json({
      statusLabels,
      statusData: statusCounts,
      durationLabels,
      durationData: durationCounts,
    });
  } catch (err) {
    console.error("Subscription analytics error:", err);
    res.status(500).json({ error: "Failed to fetch subscription analytics" });
  }
});
