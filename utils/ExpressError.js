class ExpressError extends Error {
    constructor(message, statusCode) {
        super(); //Calls the Error Constructor
        this.message = message;
        this.statusCode = statusCode
    }
}

module.exports = ExpressError;