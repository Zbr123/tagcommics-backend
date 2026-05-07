const { StatusCodes } = require("http-status-codes");
const stripeService = require("../services/stripe.service");

// Create checkout session
const createCheckoutSessionController = async (req, res) => {
  try {
    const customerId = req.user.user_id;
    const customerEmail = req.user.email;
    const { items } = req.body;

    const result = await stripeService.createCheckoutSession(
      customerId,
      items,
      customerEmail,
    );

    res.status(result.status).send({
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error(
      "stripe.controller.js->createCheckoutSessionController",
      error,
    );
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "Internal Server Error",
    });
  }
};

// Stripe webhook handler (raw body needed for signature verification)
const handleStripeWebhookController = async (req, res) => {
  const rawBody = req.rawBody;
  console.log("Raw body length:", rawBody ? rawBody.length : "UNDEFINED");
  const signature = req.headers["stripe-signature"];

  try {
    const event = stripeService.constructEvent(rawBody, signature);
    console.log("Received webhook event:", event.type);
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        console.log(`Checkout session completed: ${session.id}`);

        // Process the payment success
        await stripeService.handleCheckoutSessionCompleted(session);
        break;

      case "checkout.session.expired":
        const expiredSession = event.data.object;
        console.log(`Checkout session expired: ${expiredSession.id}`);
        break;

      case "payment_intent.payment_failed":
        const paymentIntent = event.data.object;
        console.log(`Payment failed: ${paymentIntent.id}`);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(StatusCodes.OK).send({ received: true });
  } catch (error) {
    console.error("stripe.controller.js->handleStripeWebhookController", error);
    res.status(StatusCodes.BAD_REQUEST).send({
      message: `Webhook Error: ${error.message}`,
    });
  }
};

// Get checkout session details
const getCheckoutSessionController = async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: "session_id is required",
      });
    }

    const result = await stripeService.getCheckoutSession(session_id);
    res.status(result.status).send({
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("stripe.controller.js->getCheckoutSessionController", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  createCheckoutSessionController,
  handleStripeWebhookController,
  getCheckoutSessionController,
};
