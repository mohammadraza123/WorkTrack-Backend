import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  addLocation,
  checkIn,
  checkOut,
  deleteAttendanceRecord,
  editAttendanceRecord,
  getAllEmployeesAttendance,
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
router.get("/get-allEmployess-attendence", getAllEmployeesAttendance);
router.patch("/attendance/:id", editAttendanceRecord);
router.delete("/attendance/:id", deleteAttendanceRecord);

export default router;
