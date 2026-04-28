import express from "express";
const router = express.Router();
import multer from "multer";
import path from "path";
import fs from "fs";
import checkToken from "../middleware/checkToken.js";
import ImageController from "../controller/ImageController.js";
// Tạo thư mục lưu trữ ảnh nếu chưa tồn tại
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Cấu hình multer để lưu ảnh trong thư mục 'uploads'
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}-${random}${ext}`);
  },
});
const uploads = multer({ storage: storage });

router.get("/images", ImageController.getImage);
router.post("/images", checkToken.verifyAdmin, uploads.single("image"), ImageController.uploadImage);
router.delete("/images", checkToken.verifyAdmin, ImageController.deleteImage); //[delete] /images?_id=id
export default router;
