module.exports = class ApiError extends Error {
    status;
    errors;

    constructor(status, message, errors = []) {
        super(message);
        this.status = status;
        this.errors = errors;
    }

    /**
     * Handle HTTP status 401
     * @returns Instance of the current class
     */
    static UnauthorizedError() {
        return new ApiError(401, 'User is unauthorized')
    }

    /**
     * Handle HTTP status 400
     * @param {String} message Error message
     * @param {Array} errors Errors
     * @returns Instance of the current class with passed parameters
     */
    static BadRequest(message, errors = []) {
        return new ApiError(400, message, errors);
    }
}