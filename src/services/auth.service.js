const userService = require("./user.service");
const { StatusCodes } = require("http-status-codes");
const User = require("../models/user");
const { signJwt } = require("../utils/jwt-sign");
const ROLES = require("../enums/roles");

const register = async (body) => {
  const result = await userService.createUser({ ...body });
  return result;
};

const login = async (body) => {
  const user = await User.scope("withPassword").findOne({
    where: {
      email: body?.email,
    },
  });

  if (!user) {
    return {
      status: StatusCodes.NOT_FOUND,
      message: "User Not Found",
    };
  }

  const isValid = await user.validatePassword(body?.password);

  if (!isValid) {
    return {
      status: StatusCodes.UNAUTHORIZED,
      message: "Either Username or Password is wrong",
    };
  }

  //create access token for the user
  const token = signJwt({
    user_id: user?.user_id,
    email: body?.email,
    name: user?.name,
    is_admin: user?.user_role === ROLES.ADMIN,
  });

  return {
    status: StatusCodes.OK,
    message: "User Logged in",
    data: {
      access_token: token,
      is_admin: user?.user_role === ROLES.ADMIN,
      user: {
        user_id: user?.user_id,
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
        user_role: user?.user_role,
        created_at: user?.created_at,
        updated_at: user?.updated_at,
      },
    },
  };
};

module.exports = { register, login };
