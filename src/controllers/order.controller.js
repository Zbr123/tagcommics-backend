const orderService = require('../services/order.service')

const placeOrder = async (req, res) => {

    // this will be used for placing order for particular user
    const user_id = req?.user?.user_id;
    const result = await orderService.placeOrder({
        user_id,
        ...req?.body
    });

    res.status(result?.status).send({...result});
}

module.exports = { placeOrder }