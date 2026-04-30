const jwt = require("jsonwebtoken");
const ROLES = require("../enums/roles");
const User = require("../models/user");
const { StatusCodes } = require("http-status-codes");

const authenticate = async (req, reply) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.user_id);
        if (!user) {
            return reply.code(StatusCodes.NOT_FOUND).send({ message: "User Not found" });
        }

        req.user = user; // full user object
    } catch (err) {
        return reply.code(StatusCodes.UNAUTHORIZED).send({ message: "Unauthorized" });
    }
};

const authorizeRole = (...allowedRoles) => {
    return async (req, reply) => {
        if (!allowedRoles.includes(req.user.user_role)) {
            return reply.code(StatusCodes.FORBIDDEN).send({ message: "Forbidden" });
        }
    };
};

module.exports = { authenticate, authorizeRole };