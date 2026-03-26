import AttendanceModel from "../models/attendance.model.mjs";

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

export const getMonthlyReport = async (req, res) => {
  try {
    const userId = req.user.id;

    const records = await AttendanceModel.find({ user: userId });

    let total = 0;

    records.forEach((r) => {
      total += r.totalHours || 0;
    });

    res.json({ totalHours: total, records });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendAttendanceEmail = async (user, records, totalHours) => {
  const rows = records
    .map(
      (r) => `
      <tr>
        <td>${r.date}</td>
        <td>${new Date(r.checkIn).toLocaleTimeString()}</td>
        <td>${r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : "-"}</td>
        <td>${r.totalHours}</td>
      </tr>
    `,
    )
    .join("");

  return sendEmail({
    to: user.email,
    subject: "Your Monthly Attendance Report",
    html: `
      <div style="font-family:Arial; padding:20px;">
        <h2>Monthly Attendance</h2>

        <table border="1" cellpadding="8" cellspacing="0">
          <tr>
            <th>Date</th>
            <th>Check-In</th>
            <th>Check-Out</th>
            <th>Hours</th>
          </tr>
          ${rows}
        </table>

        <h3>Total Hours: ${totalHours}</h3>
      </div>
    `,
  });
};

export const sendAdminReport = async (usersReport) => {
  const rows = usersReport
    .map(
      (u) => `
      <tr>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${u.totalHours}</td>
      </tr>
    `,
    )
    .join("");

  return sendEmail({
    to: "admin@gmail.com",
    subject: "All Employees Monthly Report",
    html: `
      <div style="font-family:Arial; padding:20px;">
        <h2>Employees Report</h2>

        <table border="1" cellpadding="8">
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Total Hours</th>
          </tr>
          ${rows}
        </table>
      </div>
    `,
  });
};
