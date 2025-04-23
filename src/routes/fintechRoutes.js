import express from "express";
import { Router } from 'express';
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {rateLimiter} from '../middlewares/rateLimiter.js';


import {
    getBalance,
    transferFunds,
    getTransactions,
    generateInvoice,
  } from '../controllers/fintech.controller.js';

const app = express();
  
const router = Router();


app.use(rateLimiter);


router.get('/balance', verifyJwt, getBalance);
router.post('/transfer', verifyJwt, transferFunds);
router.get('/transactions', verifyJwt, getTransactions);
router.get('/invoice', verifyJwt, generateInvoice);

export default router;
