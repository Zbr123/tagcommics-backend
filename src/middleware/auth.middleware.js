const jwt = require("jsonwebtoken");
const ROLES = require("../enums/roles");
const User = require("../models/user");
const { StatusCodes } = require("http-status-codes");

const authenticate = async (req, reply) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.user_id);
        if (!user) throw new Error();

        req.user = user; // full user object
    } catch (err) {
        return reply.code(StatusCodes.UNAUTHORIZED).send({ message: "Unauthorized" });
    }
};

const authorizeAdmin = async (req, reply) => {
    if (req.user.user_role !== ROLES.ADMIN) {
        return reply.code(StatusCodes.FORBIDDEN).send({ message: "Admins only" });
    }
};

const authorizeCustomer = async (req, reply) => {
    if (req.user.user_role !== ROLES.CUSTOMER) {
        return reply.code(StatusCodes.FORBIDDEN).send({ message: "Customers only" });
    }
};


module.exports = { authenticate, authorizeAdmin, authorizeCustomer }