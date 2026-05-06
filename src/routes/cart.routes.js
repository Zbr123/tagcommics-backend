const cartController = require('../controllers/cart.controller');
const {
    validateAddCartItemRequest,
    validateUpdateCartItemRequest,
    validateCartItemId,
    validateCreateOrderFromCartRequest
} = require('../validators/cart.validator');
const ROLES = require('../enums/roles');
const { authenticate, authorizeRole } = require('../middleware/auth.middleware');

const cartRoutes = [
    // Add item to cart
    {
        url: '/cart/items',
        method: 'POST',
        preHandler: [authenticate, authorizeRole(ROLES.CUSTOMER), validateAddCartItemRequest],
        handler: cartController.addItemToCartController,
    },

    // Get cart with totals
    {
        url: '/cart',
        method: 'GET',
        preHandler: [authenticate, authorizeRole(ROLES.CUSTOMER)],
        handler: cartController.getCartController,
    },

    // Update cart item quantity
    {
        url: '/cart/items/:item_id',
        method: 'PATCH',
        preHandler: [authenticate, authorizeRole(ROLES.CUSTOMER), validateUpdateCartItemRequest, validateCartItemId],
        handler: cartController.updateCartItemController,
    },

    // Remove item from cart
    {
        url: '/cart/items/:item_id',
        method: 'DELETE',
        preHandler: [authenticate, authorizeRole(ROLES.CUSTOMER), validateCartItemId],
        handler: cartController.removeCartItemController,
    },

    // Clear cart
    {
        url: '/cart',
        method: 'DELETE',
        preHandler: [authenticate, authorizeRole(ROLES.CUSTOMER)],
        handler: cartController.clearCartController,
    },

    // Create order from cart
    {
        url: '/order/from-cart',
        method: 'POST',
        preHandler: [authenticate, authorizeRole(ROLES.CUSTOMER), validateCreateOrderFromCartRequest],
        handler: cartController.createOrderFromCartController,
    }
];

module.exports = cartRoutes;