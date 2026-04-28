import mongoose from "mongoose";
const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  refreshToken: String,
  createdAt: { type: Date, default: Date.now, expires: "365d" }, // Token hết hạn sau 7 ngày
});
const session = mongoose.model("session", sessionSchema);
export default session;
