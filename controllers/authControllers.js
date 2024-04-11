import HttpError from "../helpers/HttpError.js";
import { userSingInUpSchema } from "../schemas/usersSchemas.js";
import * as userServices from "../services/authServices.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signup = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        const user = await userServices.findUser({email});
        if (user){
            throw HttpError(409, "Email in use");
        }
        else{
        const {error} = userSingInUpSchema.validate(req.body);
        if(error) {
            throw HttpError(400, error.message);
        }
        }

        const hashPassword = await bcrypt.hash(password, 10)

        const newUser = await userServices.signup({...req.body, password: hashPassword});
        res.status(201).json({
            email: newUser.email,
            subscription: newUser.subscription,
        });
    } catch (error) {
        next(error);
    }
};

const {JWT_SECRET} = process.env;

export const signin = async (req, res, next) => {
    try{
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
    }
    catch(error){
        next(error) 
    }
};

export const getCurrent = async(req, res) => {
    const {email, subscription} = req.user;

    res.json({
        email,
        subscription,
    })
};

export const signout = async(req, res) => {
    const {_id} = req.user;
    await userServices.updateUser({_id}, {token: ""});

    res.json({
        message: "Signed Out"
    })
};