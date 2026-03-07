import bcrypt from "bcrypt"
import UserModel from "../models/auth.model.mjs";
import OtpModel from "../models/otp.model.mjs";


const handleSignup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const isUserExist = await UserModel.findOne({ email });
    if (isUserExist) {
      return res.status(403).json({
        message: "User already exists",
        success: false,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //Generate Otp
    const generateOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create new user
    const newUser = new UserModel({
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    // Send Email
    await sendOtpEmail(email, generateOtp);

    //Save Otp in db
    const saveOtp = new OtpModel({
      email,
      otp: generateOtp,
      type: "signup",
    });

    const savedOtp = await saveOtp.save();

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