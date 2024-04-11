export const handleSaveError = (error, data, next) => {
    const {name, code} = error;
    error.status = (name === "MongoServerError" && code === 11000) ? 409 : 400;
    error.message = "Email in use"
    next();
};

export const setUpdateSettings = function(next) {
    this.getOptions.new = true; 
    this.getOptions.runValidators = true;
    next();
};