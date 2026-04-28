import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    slug: { type: String },
    numberphone: { type: String },
    notificationDiscord: { type: Boolean, default: false },
    actionButton: { type: Boolean, default: true },
  },
  { timestamps: true },
);
const Setting = mongoose.model("Setting", settingSchema);
export default Setting;
