import { generateAttendanceExcel } from "../config/excelSheet.mjs";
import { sendEmailWithExcel } from "../config/sendEmailWithExcel.mjs";
import AttendanceModel from "../models/attendance.model.mjs";
import UserModel from "../models/auth.model.mjs";

export const checkIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split("T")[0];

    const existing = await AttendanceModel.findOne({
      user: userId,
      date: today,
    });

    if (existing) {
      return res.status(400).json({
        message: "Already checked in today",
      });
    }

    const newRecord = await AttendanceModel.create({
      user: userId,
      date: today,
      checkIn: new Date(),
    });

    res.status(200).json(newRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const checkOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split("T")[0];

    const record = await AttendanceModel.findOne({
      user: userId,
      date: today,
    });

    //  No check-in
    if (!record) {
      return res.status(400).json({
        message: "You have not checked in",
      });
    }

    //  Already checked out
    if (record.checkOut) {
      return res.status(400).json({
        message: "Already checked out",
      });
    }

    //  Set check-out time
    const checkOutTime = new Date();
    record.checkOut = checkOutTime;

    //  Calculate hours
    const diffMs = checkOutTime - record.checkIn;

    const diffHours = diffMs / (1000 * 60 * 60);

    // Optional: round to 2 decimal
    record.totalHours = parseFloat(diffHours.toFixed(2));

    await record.save();

    res.status(200).json({
      message: "Checked out successfully",
      data: record,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTodayAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split("T")[0];

    const record = await AttendanceModel.findOne({
      user: userId,
      date: today,
    });

    res.json(record || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// send all users monthly report via email and cronjob
export const sendMonthlyReports = async (req, res) => {
  try {
    // 🔐 Security (VERY IMPORTANT)
    if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const users = await UserModel.find();

    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    for (const user of users) {
      // ✅ Get monthly attendance
      const records = await AttendanceModel.find({
        user: user._id,
        date: {
          $gte: `${year}-${String(month + 1).padStart(2, "0")}-01`,
          $lte: `${year}-${String(month + 1).padStart(2, "0")}-31`,
        },
      });

      if (!records.length) continue;

      // ✅ Generate Excel
      const buffer = await generateAttendanceExcel(records);

      // ✅ Send Email
      await sendEmailWithExcel(user.email, buffer);

      console.log(`✅ Email sent to ${user.email}`);

      // ⚠️ Delay (avoid spam limit)
      await new Promise((r) => setTimeout(r, 1000));
    }

    res.json({ message: "All emails sent successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

//add location
export const addLocation = async (req, res) => {
  try {
    const userId = req.user.id; // get from auth middleware
    const { locationName } = req.body;

    if (!locationName) {
      return res.status(400).json({ message: "Location name is required" });
    }

    const today = new Date().toISOString().split("T")[0];

    const record = await AttendanceModel.findOne({
      user: userId,
      date: today,
    });

    if (!record) {
      return res.status(400).json({
        message:
          "Attendance record not found for today. Please check in first.",
      });
    }

    // Optional: prevent duplicate consecutive logs
    const lastLog = record.locationLogs.slice(-1)[0];
    if (!lastLog || lastLog.locationName !== locationName) {
      record.locationLogs.push({ locationName });
      await record.save();
    }

    res.status(200).json({
      message: "Location added successfully",
      locationLogs: record.locationLogs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
