const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');
const UserModel = require('../models/user-model');
class UserService {
    /**
     * Register new user
     * @param {String} email User email
     * @param {String} password User password
     * @returns A pair of tokens and new user data
     * */
    async registration(email, password) {
        const candidate = await UserModel.findOne({ email });
        if (candidate) {
            throw ApiError.BadRequest('This email address is already being used');
        }
        const hashPassword = await bcrypt.hash(password, 3);
        const activationLink = uuid.v4();
        const user = await UserModel.create({ email, password: hashPassword, activationLink });
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });
        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return { ...tokens, user: userDto }
    }

    /**
     * Activate user account
     * @param {String} activationLink Account activation link
     */
    async activate(activationLink) {
        const user = await UserModel.findOne({ activationLink });
        if (!user) {
            throw ApiError.BadRequest('Incorrect activation link');
        }
        user.isActivated = true;
        await user.save();

    }

    /**
     * Log in
     * @param {String} email User email
     * @param {String} password User password
     * @returns A pair of tokens and logged in user data
     */
    async login(email, password) {
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw ApiError.BadRequest('User is not found');
        }
        const isPassEquals = await bcrypt.compare(password, user.password);
        if (!isPassEquals) {
            throw ApiError.BadRequest('Invalid password');
        }
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });
        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return { ...tokens, user: userDto }
    }

    /**
     * Logout
     * @param {String} refreshToken Refresh token for deletion
     * @returns Deleted token
     */
    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    /**
     * Get new refresh token
     * @param {String} refreshToken Refresh token
     * @returns A pair of tokens and user data
     */
    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }
        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);
        if (!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError();
        }
        const user = await UserModel.findById(userData.id);
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });
        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return { ...tokens, user: userDto }
    }

    async getAllUsers() {
        const users = await UserModel.find();
        return users;
    }

}

module.exports = new UserService();