import express from "express";
const router = express.Router();
import Auth from "../middleware/checkToken.js";
import PostController from "../controller/PostController.js";

router.put("/replace/post/all", Auth.verifyAdmin, PostController.findAndReplaceData);
export default router;
