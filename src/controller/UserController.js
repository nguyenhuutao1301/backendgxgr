// controllers/authController.js
import User from "../models/UserModal.js"; // model usr
import Token from "../models/TokenModal.js"; // model sessin
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Otp from "../models/OtpModal.js";
import sendOtpEmail from "../untils/sendOtpEmail.js";

import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_RERESH = process.env.JWT_SECRET_RERESH;

const authUser = {
  // Hỗ trợ truyền đối tượng có _id hoặc userId
  signToken: (user) => {
    return { userId: user.userId || user._id, role: user.role };
  },
  generationAccessToken: (user) => {
    return jwt.sign(authUser.signToken(user), JWT_SECRET, {
      expiresIn: "360m",
    });
  },
  generationRefeshToken: (user) => {
    return jwt.sign(authUser.signToken(user), JWT_RERESH, {
      expiresIn: "15d",
    });
  },

  // Register user
  registerUser: async (req, res) => {
    try {
      const { username, email, password, otp } = req.body;
      // Check email
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email đã được đăng ký." });
      }
      const foundOtp = await Otp.findOne({ email });
      if (!foundOtp) return res.status(400).json({ message: "OTP không tồn tại" });
      if (foundOtp.expiresAt < Date.now()) return res.status(400).json({ message: "OTP đã hết hạn" });
      if (foundOtp.code !== otp) return res.status(400).json({ message: "OTP không đúng" });
      // Check username
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ message: "User đã tồn tại." });
      }
      // Hash password
      const hashed = await bcrypt.hash(password, 10);
      // Create new user
      const newUser = new User({
        username,
        email,
        password: hashed,
      });
      // Save to DB
      const user = await newUser.save();
      return res.status(200).json(user);
    } catch (error) {
      console.error("Error during user registration:", error);
      res.status(500).json({ message: "Lỗi máy chủ." });
    }
  },

  // Login user
  loginUser: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Thiếu thông tin đăng nhập." });
      }
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Email không tồn tại." });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Sai mật khẩu." });
      }
      if (user && isPasswordValid) {
        const accessToken = authUser.generationAccessToken(user);
        const refreshToken = authUser.generationRefeshToken(user);
        // Xóa refresh token cũ nếu có
        await Token.findOneAndDelete({ userId: user._id });
        // Lưu refresh token mới vào DB
        await Token.create({ userId: user._id, refreshToken });
        // Đặt cookie refresh token với sameSite "none" để hỗ trợ cross-origin
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: true,
          path: "/",
          sameSite: "None",
        });
        const { password, ...orther } = user._doc;
        res.status(200).json({
          message: "Đăng nhập thành công!",
          orther,
          accessToken: `Bearer ${accessToken}`,
        });
      }
    } catch (error) {
      res.status(500).json({ message: "Lỗi máy chủ.", error });
    }
  },

  // Refresh token
  refreshTokenUser: async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(403).json({ message: "Refresh token is required" });
      }
      const tokenDoc = await Token.findOne({ refreshToken });
      if (!tokenDoc) {
        return res.status(403).json({ message: "Invalid refresh token" });
      }
      jwt.verify(refreshToken, JWT_RERESH, async (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: "Invalid refresh token" });
        }
        // decoded có dạng { userId, role, iat, exp }
        // Tạo access token mới với thông tin từ decoded
        const newAccessToken = authUser.generationAccessToken(decoded);
        const newRefreshToken = authUser.generationRefeshToken(decoded);

        // Xóa refresh token cũ
        await Token.findOneAndDelete({ userId: decoded.userId });
        // Lưu refresh token mới vào DB
        await Token.create({
          userId: decoded.userId,
          refreshToken: newRefreshToken,
        });
        // Cập nhật cookie với refresh token mới
        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: true,
          path: "/",
          sameSite: "None",
        });

        res.status(200).json({
          accessToken: newAccessToken,
        });
      });
    } catch (error) {
      res.status(500).json({ message: "Error refreshing token", error });
    }
  },

  // Logout user
  logoutUser: async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      console.log("Refresh token received:", refreshToken);

      if (!refreshToken) {
        return res.status(400).json({ message: "Không tìm thấy refresh token." });
      }

      // Xóa refresh token trong DB
      const deletedToken = await Token.findOneAndDelete({ refreshToken });
      console.log("Deleted token:", deletedToken);

      // Xóa cookie refresh token
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "None",
      });
      console.log("Cookie cleared");
      return res.status(200).json({ message: "Đăng xuất thành công!" });
    } catch (error) {
      console.error("Logout error:", error);
      return res.status(500).json({ message: "Lỗi máy chủ.", error });
    }
  },

  // [GET] /api/user/[id]
  viewUser: async (req, res) => {
    try {
      const id = req.query.id;
      if (!id) {
        return res.status(400).json({ message: "ID không hợp lệ." });
      }
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "Không tìm thấy người dùng." });
      }
      return res.status(200).json({ success: true, result: user });
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ error: "Lỗi máy chủ." });
    }
  },
  // [PUT] /api/user/update/:id
  updateUser: async (req, res) => {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "Người dùng không tồn tại!!!" });
    }
    try {
      // Chỉ lấy các trường được phép cập nhật
      const { email, bio, address, avatar, phone, fullname } = req.body;
      const updatedAt = new Date();
      const updateFields = {
        email,
        updatedAt,
        bio,
        address,
        avatar,
        phone,
        fullname,
      };

      // Xóa các trường undefined (nếu không gửi lên)
      Object.keys(updateFields).forEach((key) => updateFields[key] === undefined && delete updateFields[key]);

      await User.findByIdAndUpdate(id, updateFields);
      const user = await User.findById(id);
      return res.status(200).json({
        message: "Cập nhật thành công!",
        user: user,
      });
    } catch (error) {
      return res.status(500).json({ message: "Lỗi máy chủ khi cập nhật người dùng.", error });
    }
  },
  // [PATCH] /api/user/change-password/:id
  updatePassword: async (req, res) => {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "Người dùng không tồn tại!!!" });
    }
    try {
      const { oldPassword, newPassword } = req.body;
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "Không tìm thấy người dùng." });
      }
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Mật khẩu cũ không đúng." });
      }
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedNewPassword;
      await user.save();
      return res.status(200).json({ message: "Cập nhật mật khẩu thành công!" });
    } catch (error) {
      console.error("Error updating password:", error);
      return res.status(500).json({ message: "Lỗi máy chủ.", error });
    }
  },
  getAllUser: async (req, res) => {
    try {
      const user = await User.find({}).select("username role phone email _id");
      return res.status(200).json({ message: "success", success: true, users: user });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "error server",
        success: false,
        users: [],
      });
    }
  },
  deletedUser: async (req, res) => {
    const _id = req.query._id;
    console.log(_id);
    if (!_id) {
      return res.status(404).json({
        success: false,
        message: "not found",
      });
    }
    try {
      await User.findByIdAndDelete(_id);
      return res.status(200).json({
        success: true,
        message: "success",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "server error",
      });
    }
  },
  // /api/user/register/sent-otp
  sendOtpRegisterIser: async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "Email không được bỏ trống" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 chữ số
    const expiresAt = new Date(Date.now() + 1000 * 60 * process.env.OTP_EXPIRE_MINUTES);

    try {
      // Lưu OTP vào DB
      await Otp.findOneAndUpdate({ email }, { code: otp, expiresAt }, { upsert: true, new: true });

      await sendOtpEmail(email, otp);
      return res.status(200).json({ success: true, message: "Đã gửi OTP" });
    } catch (error) {
      console.log("err:", error);
      return res.status(500).json({ success: false, message: "lỗi server" });
    }
  },
};

export default authUser;
