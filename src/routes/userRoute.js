import express from "express";
const router = express.Router();
import authUser from "../controller/UserController.js";
import checkToken from "../middleware/checkToken.js";

router.post("/user/register/send-otp", authUser.sendOtpRegisterIser);
router.post("/login", authUser.loginUser);
router.post("/register", authUser.registerUser);
router.post("/refresh", authUser.refreshTokenUser);
router.post("/logout", authUser.logoutUser);
router.put("/user/update/:id", checkToken.verifyUser, authUser.updateUser);
router.get("/user/get-all", checkToken.verifyAdmin, authUser.getAllUser);
router.delete("/user", checkToken.verifyAdmin, authUser.deletedUser);
router.get("/user", authUser.viewUser);

export default router;
