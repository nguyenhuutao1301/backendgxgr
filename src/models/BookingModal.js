import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    addressFrom: { type: String, required: true, trim: true },
    addressTo: { type: String, required: true, trim: true },
    serviceType: {
      type: String,
      required: true,
      enum: [
        "Grap Bike",
        "Grap Express",
        "Grap 4 Chỗ",
        "Grap 7 Chỗ",
        "Grap 16 Chỗ",
        "Grap 29 Chỗ",
      ], // nếu có enum cụ thể
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    additionalInfo: { type: String, trim: true, maxlength: 500 },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
    },
    status: {
      type: String,
      enum: ["đang xử lí", "đã đặt", "hoàn thành", "đã hủy"],
      default: "đang xử lí",
    },
    cancelReason: { type: String, trim: true, maxlength: 300, default: null },
    price: { type: Number, min: 0 },
    estimatedDistanceKm: { type: Number, min: 0 },
    estimatedTimeMin: { type: Number, min: 0 },
    pickupTime: { type: Date },
    completedAt: { type: Date },
    autoCancelAt: { type: Date },
    rating: { type: Number, min: 1, max: 5, default: null },
    paymentMethod: {
      type: String,
      enum: ["tiền mặt", "momo", "zaloPay", "bank_transfer"],
      default: "tiền mặt",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
// | Trường                                    | Mô tả                                                                                             |
// | ----------------------------------------- | ------------------------------------------------------------------------------------------------- |
// | `driverId`                                | Nếu bạn có hệ thống tài xế, liên kết đặt xe với tài xế cụ thể.                                    |
// | `status`                                  | Trạng thái của booking (chờ xác nhận, đã chấp nhận, đang di chuyển, đã hoàn thành, đã hủy, v.v.). |
// | `price`                                   | Chi phí tạm tính hoặc cuối cùng của chuyến đi.                                                    |
// | `estimatedDistanceKm`, `estimatedTimeMin` | Ước lượng khoảng cách và thời gian (từ Google Maps hoặc API).                                     |
// | `pickupTime`                              | Thời gian người dùng chọn để đón.                                                                 |
// | `completedAt`                             | Thời điểm hoàn tất chuyến đi.                                                                     |
// | `paymentStatus`, `paymentMethod`          | Nếu có thanh toán online (chuyển khoản, ví điện tử, tiền mặt).                                    |
// | `cancelReason`                            | Lý do hủy chuyến (nếu có).                                                                        |
// | `rating`, `feedback`                      | Đánh giá và phản hồi từ khách hàng hoặc tài xế.                                                   |
