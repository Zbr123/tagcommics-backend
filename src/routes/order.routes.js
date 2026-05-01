const { authenticate, authorizeRole } = require("../middleware/auth.middleware");
const { validatePlaceOrderRequest } = require("../validators/place-order.validator");
const ROLES = require("../enums/roles");
const orderController = require("../controllers/order.controller");

const orderRoutes = [
    {
        url: "/order",
        method: "POST",
        preHandler: [authenticate, authorizeRole(ROLES.CUSTOMER), validatePlaceOrderRequest],
        handler: orderController.placeOrder,
    },
];
module.exports = orderRoutes;