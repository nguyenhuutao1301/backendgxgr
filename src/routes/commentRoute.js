import express from "express";
const router = express.Router();
import checkToken from "../middleware/checkToken.js";
import CommentController from "../controller/CommentController.js";

router.get("/comment/:postid", CommentController.getComment);
router.post("/comment/:postid", checkToken.verifyUser, CommentController.createComment);
router.put("/comment/:id", checkToken.verifyUser, CommentController.changeComment);
router.delete("/comment/:id", checkToken.verifyUser, CommentController.deleteComment);
export default router;
