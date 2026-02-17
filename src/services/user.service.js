const { StatusCodes } = require("http-status-codes");
const User = require("../models/user");

const createUser = async ({ email, phone, name, password, userRole }) => {
    try {
        const userCreate = await User.create({
            name,
            email,
            phone,
            password,
            user_role: userRole
        });

        return {
            status: StatusCodes.CREATED,
            message: "User Created Successfully",
            data: userCreate.toJSON()
        }
    } catch (e) {
        console.log(e)
        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Error during User Creation: " + e.message
        }
    }
}


module.exports = { createUser }