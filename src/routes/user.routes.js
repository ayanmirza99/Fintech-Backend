import { Router } from "express";
import { loginUser, registerUser,getCurrentUser,createOrUpdateSubscription } from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);


router.get("/me", verifyJwt, getCurrentUser);
router.post('/subscription', verifyJwt,createOrUpdateSubscription);

export default router;
