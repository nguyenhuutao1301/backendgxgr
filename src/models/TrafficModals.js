import mongoose from "mongoose";
const trafficSchema = new mongoose.Schema(
  {
    visitorId: { type: String },
    Ip: { type: String },
    isAds: { type: Boolean, default: false },
    isBot: { type: Boolean, default: false },
    ref: { type: String, default: "/" },
    location: { type: String, default: "unknown" },
    browser: { type: String, default: "unknown" },
    device: { type: String, default: "unknown" },
    times: { type: Number, default: 1 }, // Đếm số lần truy cập
    historyIp: { type: [String], default: [] }, // Mảng chứa IP
    historyTimestamps: { type: [String], default: [] }, // array of timestamps for each visit
    historyLocation: { type: [String], default: [] }, //array of locations
    historyRef: { type: [String], default: [] }, // array of referrers
  },
  { timestamps: true }
);
const Traffic = mongoose.model("Traffic", trafficSchema);
export default Traffic;
