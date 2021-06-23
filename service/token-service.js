const jwt = require('jsonwebtoken');
const tokenModel = require('../models/token-model')
class TokenService {
    /**
     * Generate a pair of tokens
     * @param {Object} payload Data to be stored in JWT
     * @returns Return a pair of access and refresh token
     */
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '30m' });
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
        return {
            accessToken,
            refreshToken
        }
    }

    /**
     * Validate access token
     * @param {String} token Access token
     * @returns The decoded access token or null
     */
    validateAccessToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            return userData;
        } catch (e) {
            return null;
        }
    }

    /**
    * Validate refresh token
    * @param {String} token Refresh token
    * @returns The decoded refresh token or null
    */
    validateRefreshToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            return userData;
        } catch (e) {
            return null;
        }
    }

    /**
     * Save new token in database after the user has logged in or registered
     * @param {ObjectId} userId User id
     * @param {String} refreshToken Refresh token
     * @returns New token object
     */
    async saveToken(userId, refreshToken) {
        const tokenData = await tokenModel.findOne({ user: userId });
        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return tokenData.save();
        }
        const token = await tokenModel.create({ user: userId, refreshToken });
        return token;
    }

    /**
     * Remove token from database
     * @param {String} refreshToken 
     * @returns Deleted token
     */
    async removeToken(refreshToken) {
        const tokenData = await tokenModel.deleteOne({ refreshToken });
        return tokenData
    };

    /**
    * Find token from database
    * @param {String} refreshToken 
    * @returns Found token
    */
    async findToken(refreshToken) {
        const tokenData = await tokenModel.findOne({ refreshToken });
        return tokenData
    };
}

module.exports = new TokenService();