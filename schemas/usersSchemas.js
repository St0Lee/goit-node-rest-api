import Joi from "joi";

import { emailRegExp } from "../constants/user-constants.js";

export const userSingInUpSchema = Joi.object({
    password: Joi.string().required(),
    email: Joi.string().pattern(emailRegExp).required(),
});

export const userEmailSchema = Joi.object({
    email: Joi.string().pattern(emailRegExp).required(),
});


