const { StatusCodes } = require("http-status-codes");
const PAYMENT_MODES = require("../enums/payment-modes");

const allowedModes = [PAYMENT_MODES.CASH_ON_DELIVERY, PAYMENT_MODES.ONLINE_TRANSFER];

const validatePlaceOrderRequest = async (req, reply) => {
    const body = req.body || {};
    const { products, total_amount, payment_mode, stripe_customer_id } = body;

    if (!products || !Array.isArray(products) || products.length === 0) {
        return reply.code(StatusCodes.BAD_REQUEST).send({
            message: "products array is required and must not be empty",
        });
    }

    if (total_amount == null || typeof total_amount !== "number" || total_amount < 0) {
        return reply.code(StatusCodes.BAD_REQUEST).send({
            message: "total_amount must be a non-negative number",
        });
    }

    if (!payment_mode || !allowedModes.includes(payment_mode)) {
        return reply.code(StatusCodes.BAD_REQUEST).send({
            message: "payment_mode must be one of: cash-on-delivery, online-transfer",
        });
    }

    if (payment_mode === PAYMENT_MODES.ONLINE_TRANSFER && stripe_customer_id != null) {
        if (typeof stripe_customer_id !== "string") {
            return reply.code(StatusCodes.BAD_REQUEST).send({
                message: "stripe_customer_id must be a string when payment_mode is online-transfer",
            });
        }
    }
};

module.exports = { validatePlaceOrderRequest };
