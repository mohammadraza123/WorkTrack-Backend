import mongoose from "mongoose";
import dotenv from "dotenv/config";

const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;

const dbConnection = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://raza123:${DB_PASSWORD}@cluster0.pzrya0o.mongodb.net/?appName=Cluster0`,
    );
    console.log("✅ DB Connected Successfully !");
  } catch (error) {
    console.log("❌ DB not connected", error);
    
  }
};

export default dbConnection;
