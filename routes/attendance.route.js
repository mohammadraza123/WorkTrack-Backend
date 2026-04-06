import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  addLocation,
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
router.get("/add-location", addLocation);

export default router;
