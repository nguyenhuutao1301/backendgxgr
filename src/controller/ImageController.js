import Image from "../models/ImageModal.js";
class ImageController {
  // [GET] /api/images
  getImage = async (req, res, next) => {
    try {
      const image = await Image.find({}, "filePath");
      res.status(200).json({
        success: true,
        images: image,
      });
    } catch (error) {
      next(error);
    }
  };
  // [POST] /api/images
  uploadImage = async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const filePath = `/uploads/${req.file.filename}`;
      const image = new Image({ filePath });
      await image.save();
      return res.status(201).json({
        message: "success uploads!!!!!",
        path: filePath,
        success: true,
      });
    } catch (error) {
      next(error);
    }
  };
  deleteImage = async (req, res) => {
    try {
      const _id = req.query._id;
      if (!_id) {
        return res.status(404).json({
          message: "id not found",
          error: "not found",
          success: false,
        });
      }

      const deletedImage = await Image.findByIdAndDelete(_id);
      if (!deletedImage) {
        return res.status(404).json({
          message: "Image not found",
          success: false,
          error: "not found",
        });
      }
      return res.status(200).json({
        message: "Image deleted successfully",
        success: true,
        error: "",
      });
    } catch (error) {
      return res.status(500).json({
        message: "error 500 server",
        success: false,
        error: error,
      });
    }
  };
}
export default new ImageController();
