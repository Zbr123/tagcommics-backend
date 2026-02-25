const { authenticate, authorizeCustomer } = require("../middleware/auth.middleware");
const orderController= require('../controllers/order.controller');

const orderRoutes = [
    {
        url: "/order",
        method: "POST",
        preHandler: [authenticate, authorizeCustomer],
        handler: orderController.placeOrder,
    },
];
module.exports = orderRoutes;