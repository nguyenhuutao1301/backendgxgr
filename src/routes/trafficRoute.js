import express from "express";
const router = express.Router();
import TrafficController from "../controller/TrafficController.js";

router.post("/traffic/create/tracking", TrafficController.createTraffic);
router.get("/traffic/by-id", TrafficController.getTrafficById);
router.get("/traffic", TrafficController.getTraffic);
export default router;
