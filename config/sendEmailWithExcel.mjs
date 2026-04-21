import nodemailer from "nodemailer";

export const sendEmailWithExcel = async ({
  toEmail,
  buffer,
  type = "employee",
  employeeName = "",
}) => {
  // const now = new Date();
  // const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // const monthName = prevMonthDate.toLocaleString("en-US", {
  //   month: "long",
  // });

  // const year = prevMonthDate.getFullYear();

  const now = new Date();

const monthName = now.toLocaleString("en-US", {
  month: "long",
});

const year = now.getFullYear();

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let subject = "";
  let text = "";

  // ✅ Dynamic content
  if (type === "hr") {
    subject = `Monthly Attendance Report  ${monthName} ${year} - All Employees`;

    text = `
Hello HR,

Please find attached the monthly attendance report for all employees.

    `;
  } else {
    subject = `Your Monthly Attendance Report  ${monthName} ${year} `;

    text = `
Hello ${employeeName || "Employee"},

Please find attached your monthly attendance report.

    `;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject,
    text,
    attachments: [
      {
        filename:
          type === "hr"
            ? "All_Employees_Attendance.xlsx"
            : "My_Attendance_Report.xlsx",
        content: buffer,
      },
    ],
  });
};
