import Contact from "../models/Contact.js";

export const listContacts = () => Contact.find({}, "-createdAt -updatedAt");

export const addContact = data => Contact.create(data);

export const getContactById = id => {
  const data = Contact.findById(id);
  return data;
}

export const updateContactById = (id, data) => Contact.findByIdAndUpdate(id, data, { new: true });

export const removeContact = id => Contact.findByIdAndDelete(id);


