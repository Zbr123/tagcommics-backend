const { StatusCodes } = require("http-status-codes");
const Order = require("../models/order");
const Payment = require("../models/payment");

const placeOrder = async ({ user_id, ...body }) => {
    try {
        // create and then fetch order id
        const order = await Order.create({
            customer_id: user_id,
            comics: body?.products,
            total_amount: body?.total_amount,
        });

        await Payment.create({
            payment_mode: body?.payment_mode,
            order_id: order?.order_id
        });

        return {
            status: StatusCodes.CREATED,
            message: "Order Placed",
        }
    } catch (e) {
        console.log(e);
        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: e.message
        }
    }
}

module.exports = { placeOrder }