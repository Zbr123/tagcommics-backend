import Stripe from "stripe";
const { StatusCodes } = require("http-status-codes");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const handleStripeWebhook = async (request, reply) => {
  const sig = request.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      request.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return reply.code(StatusCodes.BAD_REQUEST).send(`Webhook Error: ${err.message}`);
  }
};

module.exports = { handleStripeWebhook };
