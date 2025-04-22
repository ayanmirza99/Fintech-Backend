import { User } from '../models/user.model.js';
import { Transaction } from '../models/Transaction.js';


export const getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('balance');
    if (!user) {
      return res.status(404).json({ data: null, msg: 'User not found', error: true });
    }
    return res.status(200).json({ data: user.balance, msg: 'Balance fetched', error: false });
  } catch (err) {
    return res.status(500).json({ data: null, msg: 'Server error', error: true });
  }
};

export const transferFunds = async (req, res) => {
  const { sourceId, destinationId, amount } = req.body;

  if (!sourceId || !destinationId || !amount) {
    return res.status(400).json({ data: null, msg: 'Missing fields', error: true });
  }

  try {
    const sender = await User.findById(sourceId);
    const receiver = await User.findById(destinationId);

    if (!sender || !receiver) {
      return res.status(404).json({ data: null, msg: 'Sender or receiver not found', error: true });
    }

    if (sender.balance.amount < amount) {
      return res.status(400).json({ data: null, msg: 'Insufficient balance', error: true });
    }

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
      msg: 'Transfer successful',
      error: false,
    });
  } catch (err) {
    return res.status(500).json({ data: null, msg: 'Server error', error: true });
  }
};

export const getTransactions = async (req, res) => {
  const { page = 1, pageSize = 10 } = req.query;
  const skip = (page - 1) * pageSize;

  try {
    const transactions = await Transaction.find({
      $or: [{ sender: req.userId }, { receiver: req.userId }],
    })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(pageSize))
      .populate('sender', 'name')
      .populate('receiver', 'name');

    return res.status(200).json({
      data: transactions,
      msg: 'Transactions fetched',
      error: false,
    });
  } catch (err) {
    return res.status(500).json({ data: null, msg: 'Server error', error: true });
  }
};

export const generateInvoice = async (req, res) => {
  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).json({ data: null, msg: 'Start and end dates required', error: true });
  }

  try {
    const transactions = await Transaction.find({
      $or: [{ sender: req.userId }, { receiver: req.userId }],
      timestamp: { $gte: new Date(start), $lte: new Date(end) },
    });

    const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);

    return res.status(200).json({
      data: {
        count: transactions.length,
        totalAmount,
        transactions,
      },
      msg: 'Invoice generated',
      error: false,
    });
  } catch (err) {
    return res.status(500).json({ data: null, msg: 'Server error', error: true });
  }
};
