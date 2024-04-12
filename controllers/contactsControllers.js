import {
    listContacts,
    getContactByFilter,
    removeContact,
    addContact,
    updateContactByFilter,
    countContacts
} from "../services/contactsServices.js";

import HttpError from "../helpers/HttpError.js";
import { createContactSchema, updateContactSchema, favoriteContactSchema } from "../schemas/contactsSchemas.js";

export const getAllContacts = async(req, res, next) => {
    try{
        const {_id: owner} = req.user;
        const {page = 1, limit = 20} = req.query;
        const skip = (page - 1) * limit;
        const result = await listContacts({owner}, {skip, limit});
        const total = await countContacts({owner});
        res.status(200).json({
            result,
            total
        });
    }
    catch(error) {
        next(error);
    }
};

export const getOneContact = async (req, res, next) => {
    try{
        const {_id: owner} = req.user;
        const {id} = req.params;
        const result = await getContactByFilter({owner, _id: id});
        if(!result) {
            throw HttpError(404, "Not Found")
        }
        res.json(result);
    }
    catch(error) {
        next(error);
    }
};

export const deleteContact = async (req, res, next) => {
    try{
        const {_id: owner} = req.user;
        const {id} = req.params;
        const result = await removeContact({owner, _id: id});
        if(!result) {
            throw HttpError(404, "Not Found")
        }

        res.json(result);
    }
    catch(error) {
        next(error);
    }
};

export const createContact = async (req, res, next) => {
    try {
        const {_id: owner} = req.user;
        const {error} = createContactSchema.validate(req.body);
        if(error) {
            throw HttpError(400, error.message);
        }
        const result = await addContact({...req.body, owner});
        res.status(201).json(result);
    }
    catch(error) {
        next(error);
    }
};

export const updateContact = async (req, res, next) => {
    try {
        const {_id: owner} = req.user;
        if (!req.body || Object.keys(req.body).length === 0) {
            throw HttpError(400, "Body must have at least one field");
        }
        const { error } = updateContactSchema.validate(req.body);
        if (error) {
            throw HttpError(400, error.message);
        }
        const { id } = req.params;
        const result = await updateContactByFilter({owner, _id: id}, req.body);
        if (!result) {
            throw HttpError(404, "Contact not found");
        }
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const updateStatusContact = async (req, res, next) => {
    try{
        const { id } = req.params;
        const { favorite, ...data } = req.body;
        
        if (Object.keys(data).length !== 0) {
            throw HttpError(400, "Only the 'favorite' field can be updated");
        }
        const { error } = favoriteContactSchema.validate(req.body);
        if (error) {
            throw HttpError(400, error.message);
        }
        const result = await updateContactByFilter({owner, _id: id}, { favorite });
        if (!result) {
            throw HttpError(404, "Contact not found");
        }
        res.json(result);
    }
    catch(error) {
        next(error);
    }
};




