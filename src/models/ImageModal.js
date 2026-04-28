// models/User.js
import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    filePath: { type: String },
  },
  { timestamps: true }
);

const Image = mongoose.model("Image", imageSchema);
export default Image;
