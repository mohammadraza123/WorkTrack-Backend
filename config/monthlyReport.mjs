import cron from "node-cron";
import { getAllUsers } from "@/services/user"; // fetch all users
import { getMonthlyAttendance } from "../controllers/attendance.controller.mjs";
import { generateAttendanceExcel } from "./excelSheet.mjs";
import { sendEmailWithExcel } from "./sendEmailWithExcel.mjs";

// Cron schedule: 1st day of every month at 12:00 AM
cron.schedule("0 0 1 * *", async () => {
  console.log("Running monthly attendance email job...");

  try {
    const users = await getAllUsers(); // Get all users from DB

    const now = new Date();
    const month = now.getMonth(); // 0-indexed
    const year = now.getFullYear();

    for (const user of users) {
      // 1️⃣ Get monthly attendance
      const records = await getMonthlyAttendance(user._id, month, year);

      // 2️⃣ Generate Excel
      const buffer = await generateAttendanceExcel(records);

      // 3️⃣ Send Email
      await sendEmailWithExcel(user.email, buffer);

      console.log(`Sent monthly report to ${user.email}`);
    }
  } catch (err) {
    console.error("Error in cron job:", err);
  }
});
