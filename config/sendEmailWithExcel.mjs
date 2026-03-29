import nodemailer from "nodemailer";

export const sendEmailWithExcel = async (toEmail, buffer) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // or your SMTP
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER, // your email
      pass: process.env.EMAIL_PASS, // app password
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "Your Monthly Attendance Report",
    text: "Please find attached your monthly attendance report.",
    attachments: [
      {
        filename: "Attendance.xlsx",
        content: buffer,
      },
    ],
  });
};
