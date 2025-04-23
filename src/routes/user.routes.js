import { Router } from "express";
import { loginUser, registerUser,getCurrentUser,createOrUpdateSubscription } from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
    getBalance,
    transferFunds,
    getTransactions,
    generateInvoice,
  } from '../controllers/fintech.controller.js';
  
const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);


router.get("/auth-me", verifyJwt, getCurrentUser);
router.post('/subscription', verifyJwt,createOrUpdateSubscription);



router.get('/balance', verifyJwt, getBalance);
router.post('/transfer', verifyJwt, transferFunds);
router.get('/transactions', verifyJwt, getTransactions);
router.get('/invoice', verifyJwt, generateInvoice);

export default router;
