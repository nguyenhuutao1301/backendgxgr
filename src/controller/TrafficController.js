import { UAParser } from "ua-parser-js";
import Traffic from "../models/TrafficModals.js";
import Settings from "../models/setting.models.js";
import { sendTelegramMessage } from "../helpers/telegram/index.js";
import { isbot } from "isbot";

class TrafficController {
  /* ================= HELPER ================= */

  cleanIp(ip) {
    return ip?.replace("::ffff:", "") || "unknown";
  }

  isIpBlocked(ip, rules) {
    return rules.some((rule) => (rule.split(".").length < 4 ? ip.startsWith(rule + ".") : ip === rule));
  }

  formatLocation(lat, lon) {
    if (!lat || !lon) return "không lấy được vị trí";
    return `https://www.google.com/maps/place/${lat},${lon}`;
  }

  async shouldSendNotification({ ip, userAgent, slug }) {
    const blockedIps = ["72.14.199"];

    if (isbot(userAgent || "")) return false;
    if (this.isIpBlocked(ip, blockedIps)) return false;

    const setting = await Settings.findOne({ slug }).select("notificationDiscord").lean();

    if (!setting) return true;

    return setting.notificationDiscord !== true;
  }

  async sendTelegramSafe(data) {
    try {
      await sendTelegramMessage(data);
    } catch (err) {
      console.error("❌ Telegram error:", err.message);
    }
  }

  /* ================= CREATE TRAFFIC ================= */

  createTraffic = async (req, res) => {
    try {
      const { lat, lon, referrer, userAgent, visitorId, slug } = req.body || {};

      if (!visitorId) {
        return res.status(400).json({ error: "visitorId required" });
      }

      const ipRaw = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket?.remoteAddress;

      const ip = this.cleanIp(ipRaw);

      const parser = new UAParser(userAgent || "");
      const browser = parser.getBrowser().name || "unknown";

      const deviceInfo = parser.getDevice();
      const device = deviceInfo.model ? `${deviceInfo.vendor || "android"} ${deviceInfo.model}` : "Desktop";

      const isBotUser = isbot(userAgent || "");

      const location = this.formatLocation(lat, lon);

      /* ================= CHECK EXISTING VISITOR ================= */

      let visitor = await Traffic.findOne({ visitorId });

      if (visitor) {
        visitor.times += 1;
        visitor.ref = referrer;

        visitor.historyIp.push(ip);
        visitor.historyRef.push(referrer);
        visitor.historyLocation.push(location);
        visitor.historyTimestamps.push(new Date());

        /* ===== limit history ===== */

        const limit = 100;

        if (visitor.historyIp.length > limit) {
          visitor.historyIp.shift();
          visitor.historyRef.shift();
          visitor.historyLocation.shift();
          visitor.historyTimestamps.shift();
        }

        const lastVisit = visitor.historyTimestamps[visitor.historyTimestamps.length - 2];

        const timeSinceLastVisit = lastVisit ? Date.now() - new Date(lastVisit).getTime() : Infinity;

        await visitor.save();

        /* ===== SEND TELEGRAM ===== */

        if (timeSinceLastVisit > 60_000 && (await this.shouldSendNotification({ ip, userAgent, slug }))) {
          await this.sendTelegramSafe({
            ip,
            lat,
            lon,
            referrer,
            device,
            browser,
            userAgent,
          });
        }

        return res.status(200).json({
          message: "Visitor updated",
        });
      }

      /* ================= NEW VISITOR ================= */

      const newTraffic = new Traffic({
        visitorId,
        Ip: ip,
        isBot: isBotUser,
        ref: referrer,
        browser,
        device,
        isAds: referrer?.includes("gclid") ?? false,
        location,
        times: 1,
        historyIp: [ip],
        historyRef: [referrer],
        historyLocation: [location],
        historyTimestamps: [new Date()],
      });

      await newTraffic.save();

      if (await this.shouldSendNotification({ ip, userAgent, slug })) {
        await this.sendTelegramSafe({
          ip,
          lat,
          lon,
          referrer,
          device,
          browser,
          userAgent,
        });
      }

      return res.status(200).json({
        message: "New visitor tracked",
      });
    } catch (err) {
      console.error("❌ Error tracking traffic:", err);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  };

  /* ================= GET TRAFFIC ================= */

  getTraffic = async (req, res) => {
    try {
      const data = await Traffic.find()
        .select("Ip isAds isBot updatedAt times ref _id")
        .sort({ updatedAt: -1 })
        .limit(500)
        .lean();

      if (!data.length) {
        return res.status(404).json({
          message: "no traffic data found",
        });
      }

      return res.json({
        success: true,
        result: data,
      });
    } catch (err) {
      console.error("❌ Error fetching traffic:", err);
      return res.status(500).json({
        error: "Failed to fetch traffic",
      });
    }
  };

  /* ================= GET TRAFFIC BY ID ================= */

  getTrafficById = async (req, res) => {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "id required",
        });
      }

      const traffic = await Traffic.findById(id).lean();

      if (!traffic) {
        return res.status(404).json({
          success: false,
          message: "not found data",
        });
      }

      return res.status(200).json({
        success: true,
        result: traffic,
      });
    } catch (error) {
      console.error("❌ getTrafficById error:", error);

      return res.status(500).json({
        success: false,
        message: "server error",
      });
    }
  };
}

export default new TrafficController();
