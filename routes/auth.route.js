import express from "express";
const router = express.Router();

import {
  handleForgotPassword,
  handleLogin,
  handleResetPassword,
  handleSignup,
  handleVerifyEmail,
} from "../controllers/auth.controller.mjs";

//signup
router.post("/register", handleSignup);

//login
router.post("/login", handleLogin);

//verifyEmail
router.post("/verify", handleVerifyEmail);

//reset password
router.post("/resetpassword", handleResetPassword);

//forgot password
router.post("/forgot", handleForgotPassword);

export default router;
