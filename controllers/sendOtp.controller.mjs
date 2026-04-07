import { transporter } from "../config/email.mjs";

export const sendOtpEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `"Work Track" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
          <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 30px; border-radius: 10px; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            
            <h2 style="color: #333;">Work Track</h2>
            <p style="color: #555; font-size: 16px;">
              Hello,
            </p>
            
            <p style="color: #555; font-size: 16px;">
              Your One-Time Password (OTP) for verification is:
            </p>
            
            <h1 style="color: #4CAF50; letter-spacing: 5px;">
              ${otp}
            </h1>
            
            <p style="color: #777; font-size: 14px;">
              This code will expire in <strong>5 minutes</strong>.
            </p>

            <hr style="margin: 20px 0;" />

            <p style="color: #999; font-size: 12px;">
              If you did not request this code, please ignore this email.
            </p>

            <p style="color: #aaa; font-size: 12px;">
              © ${new Date().getFullYear()} Work Track. All rights reserved.
            </p>

          </div>
        </div>
      `,
    });

    return { success: true };
  } catch (err) {
    console.log("Email error:", err);
    return { success: false, error: err };
  }
};
