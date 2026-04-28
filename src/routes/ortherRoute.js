import express from "express";
const router = express.Router();
import OrtherController from "../controller/OrtherController.js";

router.post("/sentmessage/discord/traffic", OrtherController.sentMessageTrafficDiscord);
export default router;
