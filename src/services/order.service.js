const { StatusCodes } = require("http-status-codes");
const Order = require("../models/order");
const Payment = require("../models/payment");

const placeOrder = async ({ user_id, products, total_amount, payment_mode, stripe_customer_id }) => {
    try {
        const order = await Order.create({
            customer_id: user_id,
            comics: products,
            total_amount,
        });

        const paymentPayload = {
            payment_mode,
            order_id: order.order_id,
        };
        // Store Stripe customer id only for online payments; leave null for cash-on-delivery
        if (payment_mode === "online-transfer" && stripe_customer_id) {
            paymentPayload.stripe_customer_id = stripe_customer_id;
        }

        await Payment.create(paymentPayload);

        return {
            status: StatusCodes.CREATED,
            message: "Order Placed",
        };
    } catch (e) {
        console.error(e);
        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: e.message,
        };
    }
};

module.exports = { placeOrder };
