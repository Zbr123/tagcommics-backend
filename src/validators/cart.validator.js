const { StatusCodes } = require("http-status-codes");

const ITEM_TYPES = ['comic', 'character_book'];
const MAX_QUANTITY = 20;

const validateAddCartItemRequest = async (req, reply) => {
    const body = req.body || {};
    const { item_type, item_id, quantity = 1 } = body;

    if (!item_type || !ITEM_TYPES.includes(item_type)) {
        return reply.code(StatusCodes.BAD_REQUEST).send({
            message: `item_type must be one of: ${ITEM_TYPES.join(', ')}`
        });
    }

    if (!item_id || typeof item_id !== 'string') {
        return reply.code(StatusCodes.BAD_REQUEST).send({
            message: "item_id is required and must be a string"
        });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(item_id)) {
        return reply.code(StatusCodes.BAD_REQUEST).send({
            message: "item_id must be a valid UUID"
        });
    }

    if (quantity < 1 || quantity > MAX_QUANTITY || !Number.isInteger(quantity)) {
        return reply.code(StatusCodes.BAD_REQUEST).send({
            message: `quantity must be an integer between 1 and ${MAX_QUANTITY}`
        });
    }
};

const validateUpdateCartItemRequest = async (req, reply) => {
    const { quantity } = req.body || {};

    if (quantity == null) {
        return reply.code(StatusCodes.BAD_REQUEST).send({
            message: "quantity is required"
        });
    }

    if (!Number.isInteger(quantity)) {
        return reply.code(StatusCodes.BAD_REQUEST).send({
            message: "quantity must be an integer"
        });
    }

    if (quantity < 0 || quantity > MAX_QUANTITY) {
        return reply.code(StatusCodes.BAD_REQUEST).send({
            message: `quantity must be between 0 and ${MAX_QUANTITY}. Use 0 to remove item.`
        });
    }
};

const validateCartItemId = async (req, reply) => {
    const { item_id } = req.params;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(item_id)) {
        return reply.code(StatusCodes.BAD_REQUEST).send({
            message: "item_id must be a valid UUID"
        });
    }
};

const validateCreateOrderFromCartRequest = async (req, reply) => {
    const body = req.body || {};
    const { payment_mode } = body;

    const allowedModes = ['cash-on-delivery', 'online-transfer'];
    if (!payment_mode || !allowedModes.includes(payment_mode)) {
        return reply.code(StatusCodes.BAD_REQUEST).send({
            message: `payment_mode must be one of: ${allowedModes.join(', ')}`
        });
    }
};

module.exports = {
    validateAddCartItemRequest,
    validateUpdateCartItemRequest,
    validateCartItemId,
    validateCreateOrderFromCartRequest,
    MAX_QUANTITY
};