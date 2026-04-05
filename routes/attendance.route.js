import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  checkIn,
  checkOut,
  getTodayAttendance,
  sendMonthlyReports,
} from "../controllers/attendance.controller.mjs";

const router = express.Router();

router.post("/check-in", authMiddleware, checkIn);
router.post("/check-out", authMiddleware, checkOut);
router.get("/get-attendance", authMiddleware, getTodayAttendance);
router.get("/send-monthly-report", sendMonthlyReports);

export default router;
