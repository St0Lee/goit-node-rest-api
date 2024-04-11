import express from "express"

import {
    signup, 
    signin, 
    getCurrent,
    signout
} from "../controllers/authControllers.js";

import authenticate from "../middlewares/authenticate.js";

const authRouter = express.Router();

authRouter.post("/register", signup);
authRouter.post("/login", signin);
authRouter.get("/current", authenticate, getCurrent);
authRouter.post("/logout", authenticate, signout);

export default authRouter;