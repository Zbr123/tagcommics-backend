const authController = require('../controllers/auth.controller')
const { loginSchema, signupSchema } = require('../schema/auth.schema')
const authValidator = require('../validators/auth.validator')

const authRoutes = [
    {
        url: '/auth/register',
        method: 'POST',
        preHandler: authValidator.registerValidator,
        schema: signupSchema,
        handler: authController.registerController
    },
    {
        url: '/auth/login',
        method: 'POST',
        preHandler: authValidator.loginValidator,
        schema: loginSchema,
        handler: authController.loginController
    }
]

module.exports = authRoutes