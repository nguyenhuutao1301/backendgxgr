// utils/sendOtpEmail.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOtpEmail(toEmail, otp) {
  const mailOptions = {
    from: `Đăng ký <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Mã xác minh OTP",
    html: `<p>Mã OTP của bạn là: <strong>${otp}</strong></p><p>OTP sẽ hết hạn sau 5 phút.</p>`,
  };

  await transporter.sendMail(mailOptions);
}

export default sendOtpEmail;
