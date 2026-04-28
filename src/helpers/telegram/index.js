import axios from "axios";
import https from "https";

const axiosClient = axios.create({
  timeout: 5000,
});
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

/* force IPv4 để tránh lỗi ETIMEDOUT */
const httpsAgent = new https.Agent({
  family: 4,
});

function escapeMarkdown(text = "") {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
}

async function sendTelegramMessage({ ip, lat, lon, referrer, device, browser, userAgent }) {
  const mapUrl = lat && lon ? `https://www.google.com/maps?q=${lat},${lon}` : "không lấy được vị trí";

  const text = `
👤 *Truy cập từ:* ${escapeMarkdown(referrer || "Trực tiếp")}

🌐 *IP:* \`${escapeMarkdown(ip)}\`
📍 *Vị trí:* ${mapUrl}

💻 *Thiết bị:* ${escapeMarkdown(device)}
🌍 *Trình duyệt:* ${escapeMarkdown(browser)}

⏰ ${new Date().toLocaleString()}
`;

  try {
    return await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: TELEGRAM_CHAT_ID,
        text,
        disable_web_page_preview: true,
      },
      {
        httpsAgent,
        timeout: 5000,
      },
    );
  } catch (error) {
    console.error("Telegram error:", error.message);
  }
}
export async function sendOrderToTelegram({ addressFrom, addressTo, phoneNumber, serviceType, additionalInfo }) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return false;

  const text = `
🚗 *ĐƠN HÀNG MỚI*

📍 *Điểm đón:* ${addressFrom}
📍 *Điểm đến:* ${addressTo}

📞 *SĐT:* ${phoneNumber}

🚘 *Dịch vụ:* ${serviceType}

📝 *Thông tin thêm:*
${additionalInfo || "Không có"}

⏰ ${new Date().toLocaleString()}
`;

  try {
    await axiosClient.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text,
    });

    return true;
  } catch (error) {
    console.error("❌ Telegram order error:", error?.response?.data || error.message);
    return false;
  }
}

export { sendTelegramMessage };
