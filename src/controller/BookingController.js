import Booking from "../models/BookingModal.js";
import { sendOrderToTelegram } from "../helpers/telegram/index.js";

class BookingController {
  createBooking = async (req, res) => {
    try {
      const { userId, ...dataBooking } = req.body;
      const { addressFrom, addressTo, serviceType, phoneNumber, additionalInfo } = dataBooking;
      if (!addressFrom || !serviceType || !phoneNumber) {
        return res.status(400).json({ message: "error", err: "Thiếu thông tin bắt buộc." });
      }

      await sendOrderToTelegram(dataBooking); // gửi 1 lần duy nhất

      // Nếu không đăng nhập => không lưu vào DB
      if (!userId) {
        return res.status(201).json({
          message: "success",
          err: "",
        });
      }

      // Nếu có user => lưu thêm userId
      const newBooking = new Booking({
        ...dataBooking,
        userId,
      });

      const savedBooking = await newBooking.save();

      return res.status(201).json({
        message: "success",
        booking: savedBooking,
      });
    } catch (error) {
      console.error("Lỗi tạo đơn đặt xe:", error);
      return res.status(500).json({ message: "error", err: "Lỗi server, vui lòng thử lại sau." });
    }
  };
  // [POST] /booking/get-all/history
  getHistoryBooking = async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "error", err: "invalid Id" });
      }
      const history = await Booking.find({ userId })
        .select("addressFrom addressTo createdAt serviceType status _id rating")
        .sort({ createdAt: -1 });

      return res.status(200).json({ message: "success", err: "", history });
    } catch (error) {
      return res.status(500).json({ message: "error", err: "server error" });
    }
  };
  getAllBooking = async (req, res) => {
    try {
      const result = await Booking.find({})
        .populate("userId", "username")
        .select("addressFrom addressTo serviceType userId status price createAt _id");
      return res.status(200).json({
        success: true,
        message: "success",
        result,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "server error",
        result: [],
      });
    }
  };
  // [DELETE] /booking/delete?id=${id}
  deleteBookingById = async (req, res) => {
    const _id = req.query.id;
    if (!_id) {
      console.log("can't id:", _id);
      return res.status(404).json({
        success: false,
        message: "not found",
        err: "can't receiver id",
      });
    }
    try {
      const result = await Booking.findByIdAndDelete(_id).exec();
      res.status(200).json({
        success: true,
        message: "success",
        err: "",
      });
    } catch (error) {
      console.log("server err:", error);
      return res.status(500).json({
        success: false,
        message: "server error",
        err: "500 server err",
      });
    }
  };
  // [PUT] /booking/update?id=${id}
  updateBooking = async (req, res) => {
    const _id = req.query.id;
    if (!_id) {
      console.log("can't receiver data:", _id);
      return res.status(404).json({
        success: false,
        message: "not found",
      });
    }
    try {
      const orther = req.body;

      Object.keys(orther).forEach((key) => orther[key] === undefined && delete orther[key]);
      await Booking.findByIdAndUpdate(_id, orther);
      return res.status(200).json({
        success: true,
        message: "success",
      });
    } catch (error) {
      console.log("500 err :", error);
      return res.status(500).json({
        success: false,
        message: "server err",
      });
    }
  };
}

export default new BookingController();
