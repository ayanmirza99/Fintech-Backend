import { Router } from "express";
import { loginUser, registerUser,getCurrentUser } from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);


router.get("/me", verifyJwt, getCurrentUser);

export default router;
