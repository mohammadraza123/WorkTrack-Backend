// import mongoose from "mongoose";

// const DB_USERNAME = process.env.DB_USERNAME;
// const DB_PASSWORD = process.env.DB_PASSWORD;

// const dbConnection = async () => {
//   try {
//     await mongoose.connect(
//       `mongodb+srv://raza123:${DB_PASSWORD}@cluster0.pzrya0o.mongodb.net/?appName=Cluster0`,
//     );
//     console.log("✅ DB Connected Successfully !");
//   } catch (error) {
//     console.log("❌ DB not connected", error);

//   }
// };

// export default dbConnection;

import mongoose from "mongoose";
import dotenv from "dotenv/config";

const MONGO_URI = `mongodb+srv://raza123:${process.env.DB_PASSWORD}@cluster0.pzrya0o.mongodb.net/?appName=Cluster0`;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
  console.log("🆕 Creating new global mongoose cache");
}

const dbConnection = async () => {
  // ✅ Already connected
  if (cached.conn) {
    console.log("⚡ Using existing DB connection");
    return cached.conn;
  }

  // ⏳ First time connecting
  if (!cached.promise) {
    console.log("🔌 Connecting to MongoDB...");

    cached.promise = mongoose.connect(MONGO_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000,
    });
  } else {
    console.log("⏳ Waiting for existing connection promise...");
  }

  try {
    cached.conn = await cached.promise;
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    cached.promise = null; // reset so it can retry
    throw error;
  }

  return cached.conn;
};

export default dbConnection;