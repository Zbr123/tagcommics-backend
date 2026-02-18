const userService = require('./user.service');
const { StatusCodes } = require("http-status-codes");
const User = require("../models/user");
const { signJwt } = require("../utils/jwt-sign");
const { comparePassword } = require('../utils/compare-password');


const register = async (body) => {
    const result = await userService.createUser({ ...body });
    return result;
}

const login = async (body) => {

    const user = await User.findOne({
        where: {
            email: body?.email
        }
    });

    if (!user) {
        return {
            status: StatusCodes.NOT_FOUND,
            message: "User Not Found",
        }
    }
    const isValid = await comparePassword(body?.password,user?.password);

    if (!isValid) {
        return {
            status: StatusCodes.UNAUTHORIZED,
            message: "Password is wrong",
        }
    }

    //create access token for the user
    const token = signJwt({ email: body?.email, name: user?.name });

    return {
        status: StatusCodes.OK,
        message: "User Logged in",
        data: {
            accessToken: token
        }
    }
}

module.exports = { register, login }