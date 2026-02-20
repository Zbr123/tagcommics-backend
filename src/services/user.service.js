const { StatusCodes } = require("http-status-codes");
const User = require("../models/user");
const { encryptPassword } = require("../utils/encrypt-password");
const ROLES = require("../enums/roles");

const createUser = async ({ email, phone, name, password, userRole }) => {
    try {

        const isUserExists = await User.findOne({
            where: {
                email
            }
        });

        if (isUserExists) {
            return {
                status: StatusCodes.CONFLICT,
                message: "User Already exists"
            }
        }

        const userCreate = await User.create({
            name,
            email,
            phone,
            password,
            user_role: userRole || ROLES.CUSTOMER
        });

        // convert the data into json
        const userData = userCreate.toJSON();

        // do not show password
        delete userData.password;

        return {
            status: StatusCodes.CREATED,
            message: "User Created Successfully",
            data: userData
        };
    } catch (e) {
        console.log(e)
        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Error during User Creation: " + e.message
        }
    }
}


module.exports = { createUser }