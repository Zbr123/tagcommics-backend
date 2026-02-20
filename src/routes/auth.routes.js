const authController = require('../controllers/auth.controller')
const authValidator = require('../validators/auth.validator')

const authRoutes = [
    {
        url: '/auth/register',
        method: 'POST',
        preHandler: authValidator.registerValidator,
        schema: {
            summary: "Register a new user",
            tags: ["Auth"],
            body: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                    name: { type: "string" },
                    email: { type: "string", format: "email" },
                    password: { type: "string" },
                    phone: { type: "string" },
                    userRole: { type: "string", enum: ["customer", "admin"] },
                },
            },
            response: {
                201: {
                    type: "object",
                    properties: {
                        status: { type: "number", example: 201 },
                        message: { type: "string" },
                        data: { type: "object" },
                    },
                },
                409: {},
                500: {},
            },
        },
        handler: authController.registerController
    },
    {
        url: '/auth/login',
        method: 'POST',
        preHandler: authValidator.loginValidator,
        schema: {
            summary: "Login",
            tags: ["Auth"],
            body: {
                type: "object",
                required: ["email", "password"],
                properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string" },
                },
            },
            response: {
                200: {
                    type: "object",
                    properties: {
                        status: { type: "number" },
                        message: { type: "string" },
                        data: {
                            type: "object",
                            properties: {
                                token: { type: "string" },
                                user: { type: "object" },
                            },
                        },
                    },
                },
                401: {},
                500: {},
            },
        },
        handler: authController.loginController
    }
]

module.exports = authRoutes