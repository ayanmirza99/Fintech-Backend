import express from "express";
import {
  getAllUsers,
  cancelUserSubscription,
  getLogs,
  getRecentSignups,
  getSubscriptionAnalytics,
} from "../controllers/admin.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

router.use(verifyJwt, isAdmin);

router.get("/users", getAllUsers);
router.post("/subscriptions/cancel", cancelUserSubscription);
router.get("/logs", getLogs);
router.get("/recentSignUps", getRecentSignups);
router.get("/subscription-distribution", getSubscriptionAnalytics);

export default router;
