const { authenticate, authorizeRole } = require("../middleware/auth.middleware");
const ROLES = require("../enums/roles");
const stripeController = require("../controllers/stripe.controller");

const stripeRoutes = [
    {
        url: "/stripe/webhook",
        method: "POST",
        preHandler: [authenticate, authorizeRole(ROLES.CUSTOMER)],
        handler: stripeController.handleStripeWebhook,
    },
];
module.exports = stripeRoutes;