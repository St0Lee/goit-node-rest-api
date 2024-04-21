import HttpError from "../helpers/HttpError.js";
import { userSingInUpSchema } from "../schemas/usersSchemas.js";
import * as userServices from "../services/authServices.js";

import gravatar from "gravatar";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import Jimp from "jimp";

const avatarPath = path.resolve("public", "avatars");

export const signup = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        if (!password) {
            throw HttpError(400, "Password is required");
        }

        const user = await userServices.findUser({ email });
        if (user) {
            throw HttpError(409, "Email in use");
        }

        const { error } = userSingInUpSchema.validate(req.body);
        if (error) {
            throw HttpError(400, error.message);
        }
        const avatarURL = await gravatar.url(email);

        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = await userServices.signup({ ...req.body, avatarURL: avatarURL, password: hashPassword });
        res.status(201).json({
            user: {
                email: newUser.email,
                subscription: newUser.subscription,
            }
        });
    } catch (error) {
        next(error);
    }
};

const {JWT_SECRET} = process.env;

export const signin = async (req, res) => {
        const {email, password} = req.body;
        const user = await userServices.findUser({email});
        const {error} = userSingInUpSchema.validate(req.body);
        if(error) {
            throw HttpError(400, error.message);
        }
        if(!user){
            throw HttpError(401, "Email or password is wrong");
        }
        const passwordCompare = await bcrypt.compare(password, user.password);
        if(!passwordCompare){
            throw HttpError(401, "Email or password is wrong");
        }

        const {_id: id} = user;

        const payload = {
            id
        };

        const token = jwt.sign(payload, JWT_SECRET, {expiresIn: "72h"});
        await userServices.updateUser({_id: id}, {token});

        res.json({
            token: token,
            user: {
                email: user.email,
                subscription: user.subscription,
            }
        })
    };

export const getCurrent = async(req, res) => {
    const {email, subscription} = req.user;

    res.json({
        email,
        subscription,
    })
};

export const updateAvatar = async (req, res) => {
    try {
        const { path: oldPath, filename } = req.file;
        const newPath = path.join(avatarPath, filename);

        await fs.rename(oldPath, newPath);

        const resizedImg = await Jimp.read(newPath);
        resizedImg.resize(250, 250).write(newPath);

        const avatarURL = path.join("avatars", filename);

        res.status(200).json({ avatarURL });
    } catch (error) {
        res.status(401).json({ message: "Failed to update avatar" });
    }
};  

export const signout = async(req, res) => {
    const {_id} = req.user;
    await userServices.updateUser({_id}, {token: ""});

    res.status(204).json()
};

