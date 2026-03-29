import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { checkIn, checkOut } from "../controllers/attendance.controller.mjs";

const router = express.Router();

router.post("/check-in", authMiddleware, checkIn);
router.post("/check-out", authMiddleware, checkOut);

export default router;
