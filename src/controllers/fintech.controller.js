import { User } from "../models/user.model.js";
import { Transaction } from "../models/Transaction.js";
import mongoose from "mongoose";

export const getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("balance");
    if (!user) {
      return res
        .status(404)
        .json({ data: null, message: "User not found", error: true });
    }
    return res
      .status(200)
      .json({ data: user.balance, message: "Balance fetched", error: false });
  } catch (err) {
    return res
      .status(500)
      .json({ data: null, message: "Server error", error: true });
  }
};

export const transferFunds = async (req, res) => {
  const sourceId = req.body.sourceId?.trim();
  const destinationId = req.body.destinationId?.trim();
  const amount = Number(req.body.amount);

  // Basic validation
  if (!sourceId || !destinationId || isNaN(amount) || amount <= 0) {
    return res.status(400).json({
      data: null,
      message: "Missing or invalid fields",
      error: true,
    });
  }

  if (
    !mongoose.Types.ObjectId.isValid(sourceId) ||
    !mongoose.Types.ObjectId.isValid(destinationId)
  ) {
    return res.status(400).json({
      data: null,
      message: "Invalid user IDs",
      error: true,
    });
  }

  try {
    const sender = await User.findById(sourceId);
    const receiver = await User.findById(destinationId);

    if (!sender || !receiver) {
      return res.status(404).json({
        data: null,
        message: "Sender or receiver not found",
        error: true,
      });
    }

    if (sender.balance.amount < amount) {
      return res.status(400).json({
        data: null,
        message: "Insufficient balance",
        error: true,
      });
    }

    // Perform transfer
    sender.balance.amount -= amount;
    sender.balance.lastUpdated = new Date();

    receiver.balance.amount += amount;
    receiver.balance.lastUpdated = new Date();

    await sender.save();
    await receiver.save();

    const transaction = new Transaction({
      sender: sender._id,
      receiver: receiver._id,
      amount,
    });

    await transaction.save();

    return res.status(200).json({
      data: { transaction },
      message: "Transfer successful",
      error: false,
    });
  } catch (err) {
    console.error("Transfer Error:", err);
    return res.status(500).json({
      data: null,
      message: "Server error",
      error: true,
    });
  }
};

export const getTransactions = async (req, res) => {
  const { page = 1, pageSize = 10 } = req.query;
  const skip = (page - 1) * pageSize;

  try {
    const transactions = await Transaction.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(pageSize))
      .populate("sender", "name")
      .populate("receiver", "name");

    return res.status(200).json({
      data: transactions,
      message: "Transactions fetched",
      error: false,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ data: null, message: "Server error", error: true });
  }
};

export const generateInvoice = async (req, res) => {
  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).json({
      data: null,
      message: "Start and end dates required",
      error: true,
    });
  }
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        data: null,
        message: "Unauthorized",
        error: true,
      });
    }
    const startDate = new Date(start);
    const endDate = new Date(end);

    const transactions = await Transaction.find({
      $or: [{ sender: userId }, { receiver: userId }],
    });

    const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);

    return res.status(200).json({
      data: {
        count: transactions.length,
        totalAmount,
        transactions,
      },
      message: "Invoice generated",
      error: false,
    });
  } catch (err) {
    console.log(err);

    return res
      .status(500)
      .json({ data: null, message: "Server error", error: true });
  }
};

export const getTransactionTrends = async (req, res) => {
  try {
    const days = 7; // last 7 days
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);

    const transactions = await Transaction.find({
      timestamp: { $gte: start, $lte: end },
    });

    const dailyTotals = {};

    for (let tx of transactions) {
      const day = tx.timestamp.toISOString().split("T")[0];
      dailyTotals[day] = (dailyTotals[day] || 0) + tx.amount;
    }

    const chartData = Object.entries(dailyTotals).map(([date, amount]) => ({
      date,
      amount,
    }));

    return res.status(200).json({
      data: chartData,
      message: "Transaction trends fetched",
      error: false,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ data: null, message: "Server error", error: true });
  }
};
