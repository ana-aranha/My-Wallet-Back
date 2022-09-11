import express from "express";
import { signUp, signIn } from "../controllers/authController.js";
import { emailExists } from "../middlewares/emailValidationMiddleware.js";

const router = express.Router();

router.use(emailExists);

router.post("/sign-up", signUp);

router.post("/sign-in", signIn);

export default router;
