import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "../models/auth.model.mjs";
import OtpModel from "../models/otp.model.mjs";
import { sendOtpEmail } from "./sendOtp.controller.mjs";

export const handleSignup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if user already exists
    const isUserExist = await UserModel.findOne({ email });
    if (isUserExist) {
      return res.status(409).json({
        message: "User already exists",
        success: false,
      });
    }

    //Generate Otp
    const generateOtp = Math.floor(100000 + Math.random() * 900000).toString();
    // Remove old OTP
    await OtpModel.deleteMany({ email, type: "signup" });

    //Save Otp in db
    const saveOtp = new OtpModel({
      email,
      otp: generateOtp,
      type: "signup",
    });

    await saveOtp.save();

    // Send Email
    await sendOtpEmail(email, generateOtp);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new UserModel({
      username,
      email,
      password: hashedPassword,
      isVerified: false,
    });

    const savedUser = await newUser.save();

    // Send response
    return res.status(201).json({
      message: "User registered successfully",
      success: true,
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
      },
    });
  } catch (error) {
    console.error("error in signup authentication", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const handleVerifyEmail = async (req, res) => {
  try {
    const { email, type, otp } = req.body;

    // Validate fields
    if (!email || !type || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and type are required",
      });
    }

    // Find OTP and ensure it is valid
    const checkVerification = await OtpModel.findOne({
      email,
      type,
      otp,
      expiresAt: { $gt: new Date() },
    });

    if (!checkVerification) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    const findUser = await UserModel.findOne({ email });

    if (!findUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // SIGNUP FLOW
    if (type === "signup") {
      if (findUser.isVerified) {
        return res.status(400).json({
          success: false,
          message: "Email already verified",
        });
      }

      findUser.isVerified = true;
      await findUser.save();

      // delete otp after signup verification
      await OtpModel.deleteOne({ _id: checkVerification._id });
    }

    // FORGOT PASSWORD FLOW
    if (type === "forgot") {
      // mark otp verified instead of deleting
      checkVerification.verified = true;
      await checkVerification.save();
    }

    return res.status(200).json({
      success: true,
      message:
        type === "signup"
          ? "Email verified successfully"
          : "OTP verified successfully",
    });
  } catch (error) {
    console.error("error in verify email", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const isUserExist = await UserModel.findOne({ email });
    if (!isUserExist) {
      return res.status(401).json({
        message: "User not found",
        success: false,
      });
    }

    if (!isUserExist.isVerified) {
      return res.status(403).json({
        message: "Please verify your email first",
        success: false,
      });
    }

    // Check password
    const checkUser = await bcrypt.compare(password, isUserExist.password);
    if (!checkUser) {
      return res.status(401).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    // Generate JWT
    const jwtToken = jwt.sign(
      {
        email: isUserExist.email,
        id: isUserExist._id,
      },
      process.env.SECRET_KEY,
      { expiresIn: "24h" },
    );

    // Response
    return res.status(200).json({
      message: {
        text: "Login successfully",
        type: "success",
      },
      success: true,
      data: {
        name: isUserExist.username,
        email: isUserExist.email,
        isVerified: isUserExist.isVerified,
        token: jwtToken,
        _id: isUserExist?._id,
      },
    });
  } catch (error) {
    console.error("error in login ", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const handleForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        success: false,
      });
    }

    // find user
    const isEmailExist = await UserModel.findOne({ email });
    if (!isEmailExist) {
      return res.status(401).json({
        message: "User not found",
        success: false,
      });
    }
    //generate Otp

    const generateOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // remove old otp
    await OtpModel.deleteMany({ email, type: "forgot" });

    //Save Otp in db
    const saveOtp = new OtpModel({
      email,
      otp: generateOtp,
      type: "forgot",
    });

    await saveOtp.save();
    await sendOtpEmail(email, generateOtp);

    return res.status(200).json({
      message: "OTP sent successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error,
      success: false,
    });
  }
};

export const handleResetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        message: "Email, OTP and password are required",
        success: false,
      });
    }

    const verifyOtp = await OtpModel.findOne({
      email,
      otp,
      type: "forgot",
      expiresAt: { $gt: new Date() },
    });

    if (!verifyOtp) {
      return res.status(401).json({
        message: "Invalid or expired OTP",
        success: false,
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    await OtpModel.deleteOne({ email, type: "forgot" });

    return res.status(200).json({
      message: "Password reset successfully",
      success: true,
    });
  } catch (error) {
    console.error("reset password error", error);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
