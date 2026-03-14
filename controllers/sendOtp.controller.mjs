import { transporter } from "../config/email.mjs";

export const sendOtpEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `"Crystal Emporia" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      html: `
        <div style="font-family:Arial; padding:20px;">
          <h2>Your OTP Code</h2>
          <p>Your verification code is:</p>
          <h1 style="color:#4CAF50">${otp}</h1>
          <p>It will expire in 5 minutes.</p>
        </div>
      `,
    });

    return { success: true };
  } catch (err) {
    console.log("Email error:", err);
    return { success: false, error: err };
  }
};
