import mongoose from "mongoose";

const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;

const dbConnection = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@weddingcluster.lg5fmhx.mongodb.net/?appName=weddingCluster`,
    );
    console.log("✅ DB Connected Successfully !");
  } catch (error) {
    console.log("❌ DB not connected", error);
  }
};

module.exports = dbConnection;
