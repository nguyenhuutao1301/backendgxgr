import Setting from "../models/setting.models.js";
import dotenv from "dotenv";
dotenv.config();
class settingController {
  createSetting = async (req, res) => {
    const { slug, numberphone, notificationDiscord, actionButton } = req.body;

    if (typeof slug !== "string" || !slug.trim() || typeof numberphone !== "string" || !numberphone.trim()) {
      return res.status(400).json({
        message: "Thiếu hoặc sai định dạng đường dẫn / số điện thoại",
        success: false,
      });
    }

    try {
      const hasSlug = await Setting.findOne({ slug });
      if (hasSlug) {
        return res.status(400).json({
          message: "Đường dẫn đã tồn tại",
          success: false,
        });
      }

      const newSetting = new Setting({
        slug,
        numberphone,
        notificationDiscord,
        actionButton,
      });

      await newSetting.save();

      // Revalidate (không block logic chính)
      fetch(`http://localhost:3000/api/revalidate/settings?secret=${process.env.REVALIDATE_SECRET}`)
        .then((res) => {
          if (!res.ok) {
            console.error("Revalidate failed:", res.status);
          }
        })
        .catch((err) => console.error("Revalidate error:", err));

      return res.status(201).json({
        message: "Đã thiết lập cài đặt thành công",
        success: true,
      });
    } catch (error) {
      console.error("500 error", error);
      return res.status(500).json({
        message: "có lỗi xảy ra khi tạo cài đặt",
        error: error.message,
        success: false,
      });
    }
  };

  readSetting = async (req, res) => {
    try {
      const result = await Setting.find({}).sort({ createdAt: -1 }).lean();

      return res.status(200).json({
        result,
        success: true,
        message: "Đã tải dữ liệu cài đặt thành công",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "có lỗi xảy ra khi tải dữ liệu cài đặt",
        error: error.message,
        success: false,
      });
    }
  };

  updateSetting = async (req, res) => {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "thiếu dữ liệu",
      });
    }

    const allowedFields = ["slug", "numberphone", "notificationDiscord", "actionButton"];
    const data = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        data[field] = req.body[field];
      }
    });

    data.updatedAt = new Date();

    try {
      const updated = await Setting.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy cài đặt",
        });
      }

      // Revalidate (không block response)
      fetch(`http://localhost:3000/api/revalidate/settings?secret=${process.env.REVALIDATE_SECRET}`).catch((err) =>
        console.error("Revalidate error:", err),
      );

      return res.status(200).json({
        success: true,
        message: "cập nhật cài đặt thành công",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "có lỗi xảy ra khi cập nhật cài đặt",
        error: error.message,
        success: false,
      });
    }
  };

  deleteSetting = async (req, res) => {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "thiếu dữ liệu",
      });
    }

    try {
      const deleted = await Setting.findByIdAndDelete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy cài đặt",
        });
      }

      fetch(`http://localhost:3000/api/revalidate/settings?secret=${process.env.REVALIDATE_SECRET}`).catch((err) =>
        console.error("Revalidate error:", err),
      );

      return res.status(200).json({
        success: true,
        message: "Xóa cài đặt thành công",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "có lỗi xảy ra khi xóa cài đặt",
        error: error.message,
        success: false,
      });
    }
  };
}
export default new settingController();
