import cron from "node-cron";
import AttendanceModel from "../models/attendance.model.mjs";
import User from "../models/user.model.mjs";
import { sendAdminReport } from "../utils/email.mjs";

cron.schedule("59 23 28-31 * *", async () => {
  try {
    console.log("Running monthly report cron...");

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // ✅ Check if today is last day of month
    if (tomorrow.getDate() !== 1) {
      return; // not last day
    }

    // ✅ Get all users
    const users = await User.find();

    const report = [];

    for (let user of users) {
      const records = await AttendanceModel.find({
        user: user._id,
      });

      let total = 0;

      records.forEach((r) => {
        total += r.totalHours || 0;
      });

      report.push({
        name: user.name,
        email: user.email,
        totalHours: total.toFixed(2),
      });
    }

    // ✅ Send email to admin
    await sendAdminReport(report);

    console.log("Monthly admin email sent ✅");
  } catch (error) {
    console.log("Cron error:", error);
  }
});
