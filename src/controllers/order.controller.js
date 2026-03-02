const orderService = require("../services/order.service");
const PAYMENT_MODES = require("../enums/payment-modes");
const { StatusCodes } = require("http-status-codes");

const placeOrder = async (req, res) => {
    const user_id = req.user?.user_id;
    if (!user_id) {
        return res.status(StatusCodes.UNAUTHORIZED).send({ message: "Unauthorized" });
    }

    const { products, total_amount, payment_mode, stripe_customer_id } = req.body || {};

    const payload = {
        user_id,
        products,
        total_amount,
        payment_mode,
    };
    if (payment_mode === PAYMENT_MODES.ONLINE_TRANSFER && stripe_customer_id != null && typeof stripe_customer_id === "string") {
        payload.stripe_customer_id = stripe_customer_id.trim() || null;
    }

    const result = await orderService.placeOrder(payload);
    res.status(result.status).send(result);
};

module.exports = { placeOrder };
