import HttpError from "../helpers/HttpError.js";
import { userSingInUpSchema, userEmailSchema } from "../schemas/usersSchemas.js";
import * as userServices from "../services/authServices.js";
import sendEmail from "../helpers/sendEmail.js";

import gravatar from "gravatar";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import Jimp from "jimp";
import { nanoid } from "nanoid";

const avatarPath = path.resolve("public", "avatars");

const {JWT_SECRET, OWN_WEBSITE_URL} = process.env;

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

        const verificationToken = nanoid();
        
        const newUser = await userServices.signup({ ...req.body, avatarURL: avatarURL, password: hashPassword, verificationToken });
        
        const verifyEmail = {
            to: "fasito7845@togito.com",
            subject: "Verify Email",
            html: `<a target="_blank" href="${OWN_WEBSITE_URL}/users/verify/${verificationToken}">Click to verify email</a>`
        }
    
        await sendEmail(verifyEmail)
        
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

export const verifyEmail = async(req, res, next) => {
    try{const {verificationToken} = req.params;
    const user = await userServices.findUser({verificationToken});
    if(!user) {
        throw HttpError( 404, "User not found");
    };

    await userServices.updateUser({_id: user._id}, {verify: true, verificationToken: ""});

    res.status(200).json({
        message: "Verification successful"
        })
    }
    catch (error) {
        next(error);
    }
};

export const resendVerification = async(req, res, next) => {
    try{
        const { error, value } = userEmailSchema.validate(req.body);
        if (error) {
            throw HttpError(400, error.message);
        }

        const {email} = value;

        const user = await userServices.findUser({email});
        if(!user){
            throw HttpError (404, "Email not found")
        }
        
        if(user.verify) {
            throw HttpError (400, "Verification has already been passed")
        }

        const verifyEmail = {
            to: email,
            subject: "Verify Email",
            html: `<a target="_blank" href="${OWN_WEBSITE_URL}/users/verify/${user.verificationToken}">Click to verify email</a>`
        }
    
        await sendEmail(verifyEmail)

        res.status(200).json({
            message: "Verification email sent"
        })
    }
    catch (error) {
        next(error);
    }
};

export const signin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await userServices.findUser({ email });
        
        if (!user) {
            throw HttpError(401, "Email or password is wrong");
        }

        if (!user.verify) {
            throw HttpError(401, "Email is not verified");
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            throw HttpError(401, "Email or password is wrong");
        }

        const {_id: id} = user;
        const payload = { id };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "72h" });
        await userServices.updateUser({ _id: id }, { token });

        res.json({
            token: token,
            user: {
                email: user.email,
                subscription: user.subscription,
            }
        });
    } catch (error) {
        next(error);
    }
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
        const {_id} = req.user

        await fs.rename(oldPath, newPath);

        const resizedImg = await Jimp.read(newPath);
        resizedImg.resize(250, 250).write(newPath);

        const avatarURL = path.join("avatars", filename);

        await userServices.updateUser({_id} ,{ avatarURL });

        res.status(200).json({ avatarURL });
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: "Failed to update avatar" });
    }
};  


export const signout = async(req, res) => {
    const {_id} = req.user;
    console.log(req.user)
    await userServices.updateUser({_id}, {token: ""});

    res.status(204).json()
};

