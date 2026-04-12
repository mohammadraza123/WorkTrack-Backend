import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  addLocation,
  checkIn,
  checkOut,
  getTodayAttendance,
  sendHRReport,
  sendMonthlyReports,
} from "../controllers/attendance.controller.mjs";

const router = express.Router();

router.post("/check-in", authMiddleware, checkIn);
router.post("/check-out", authMiddleware, checkOut);
router.get("/get-attendance", authMiddleware, getTodayAttendance);
router.post("/add-location", authMiddleware, addLocation);
router.get("/send-monthly-report", sendMonthlyReports);
router.get("/send-hr-report", sendHRReport);

export default router;
