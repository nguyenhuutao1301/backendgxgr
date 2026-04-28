// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    bio: { type: String, default: "" },
    address: { type: String, default: "" },
    avatar: { type: String, default: "http://localhost:3000/uploads/logo.png" },
    phone: { type: String, default: "" },
    fullname: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
