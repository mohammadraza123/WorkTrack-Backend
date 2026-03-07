import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["signup", "forgot"],
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => Date.now() + 5 * 60 * 1000, // expires in 5 minutes
    },
  },
  { timestamps: true },
);

const OtpModel = mongoose.model("otp", otpSchema);
export default OtpModel;
