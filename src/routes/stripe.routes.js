const stripeController = require("../controllers/stripe.controller");
const {
  authenticate,
  authorizeRole,
} = require("../middleware/auth.middleware");
const ROLES = require("../enums/roles");

const stripeRoutes = [
  // Create checkout session (customer)
  {
    url: "/stripe/create-checkout-session",
    method: "POST",
    preHandler: [authenticate, authorizeRole(ROLES.CUSTOMER)],
    handler: stripeController.createCheckoutSessionController,
  },

  // Get checkout session details (customer)
  {
    url: "/stripe/session",
    method: "GET",
    preHandler: [authenticate, authorizeRole(ROLES.CUSTOMER)],
    handler: stripeController.getCheckoutSessionController,
  },
  {
    url: "/stripe/webhook",
    method: "POST",
    config: { rawBody: true },
    handler: stripeController.handleStripeWebhookController
  },
];

module.exports = stripeRoutes;
