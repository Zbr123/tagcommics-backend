const { StatusCodes } = require("http-status-codes");
const cartService = require("../services/cart.service");

// Add item to cart
const addItemToCartController = async (req, res) => {
  try {
    const customerId = req.user.user_id;
    const { item_type, item_id, quantity = 1 } = req.body;

    const result = await cartService.addItemToCart(customerId, item_type, item_id, quantity);
    res.status(result.status).send({
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error("cart.controller.js->addItemToCartController", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "Internal Server Error"
    });
  }
};

// Get cart
const getCartController = async (req, res) => {
  try {
    const customerId = req.user.user_id;
    const result = await cartService.getCart(customerId);
    res.status(result.status).send({
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error("cart.controller.js->getCartController", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "Internal Server Error"
    });
  }
};

// Update cart item
const updateCartItemController = async (req, res) => {
  try {
    const customerId = req.user.user_id;
    const { item_id } = req.params;
    const { quantity } = req.body;

    const result = await cartService.updateCartItem(customerId, item_id, quantity);
    res.status(result.status).send({
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error("cart.controller.js->updateCartItemController", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "Internal Server Error"
    });
  }
};

// Remove item from cart
const removeCartItemController = async (req, res) => {
  try {
    const customerId = req.user.user_id;
    const { item_id } = req.params;

    const result = await cartService.removeCartItem(customerId, item_id);
    res.status(result.status).send({
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error("cart.controller.js->removeCartItemController", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "Internal Server Error"
    });
  }
};

// Clear cart
const clearCartController = async (req, res) => {
  try {
    const customerId = req.user.user_id;
    const result = await cartService.clearCart(customerId);
    res.status(result.status).send({
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error("cart.controller.js->clearCartController", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "Internal Server Error"
    });
  }
};

// Create order from cart
const createOrderFromCartController = async (req, res) => {
  try {
    const customerId = req.user.user_id;
    const { payment_mode } = req.body;

    const result = await cartService.createOrderFromCart(customerId, payment_mode);
    res.status(result.status).send({
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error("cart.controller.js->createOrderFromCartController", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "Internal Server Error"
    });
  }
};

module.exports = {
  addItemToCartController,
  getCartController,
  updateCartItemController,
  removeCartItemController,
  clearCartController,
  createOrderFromCartController
};