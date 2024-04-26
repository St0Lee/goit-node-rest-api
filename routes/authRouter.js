import express from "express"

import {
    signup, 
    signin, 
    getCurrent,
    updateAvatar,
    signout,
    verifyEmail,
    resendVerification
} from "../controllers/authControllers.js";
import upload from "../middlewares/upload.js";

import authenticate from "../middlewares/authenticate.js";

const authRouter = express.Router();

authRouter.post("/register", signup);
authRouter.post("/login", signin);
authRouter.get("/current", authenticate, getCurrent);
authRouter.post("/logout", authenticate, signout);
authRouter.patch("/avatars", authenticate, upload.single("avatar"), updateAvatar);
authRouter.get("/verify/:verificationToken", verifyEmail);
authRouter.post("/verify", resendVerification);

export default authRouter;