import { Router } from 'express';
import { verifyJwt } from "../middlewares/auth.middleware.js";

import {
    getBalance,
    transferFunds,
    getTransactions,
    generateInvoice,
  } from '../controllers/fintech.controller.js';
  
const router = Router();



router.get('/balance', verifyJwt, getBalance);
router.post('/transfer', verifyJwt, transferFunds);
router.get('/transactions', verifyJwt, getTransactions);
router.get('/invoice', verifyJwt, generateInvoice);

export default router;
