import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

// URL kết nối đến MongoDB (local hoặc MongoDB Atlas)
const MONGODB_URI = process.env.MONGODB_URI;
// Thay đổi URL nếu dùng MongoDB Atlas

// Kết nối tới MongoDB
async function connect() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully!");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
  }
}

export default connect;
