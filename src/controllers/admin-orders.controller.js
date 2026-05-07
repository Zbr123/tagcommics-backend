const { StatusCodes } = require("http-status-codes");
const adminOrdersService = require("../services/admin-orders.service");

// GET /api/v1/admin/orders
const getOrdersController = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, paymentStatus, startDate, endDate } = req.query;

    const result = await adminOrdersService.getOrders({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      status,
      paymentStatus,
      startDate,
      endDate
    });

    res.status(result.status).send({
      message: result.message,
      data: result.data.orders,
      pagination: result.data.pagination
    });
  } catch (error) {
    console.error("admin-orders.controller.js->getOrdersController", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "Internal Server Error"
    });
  }
};

// GET /api/v1/admin/orders/:id
const getOrderByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminOrdersService.getOrderById(id);

    res.status(result.status).send({
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error("admin-orders.controller.js->getOrderByIdController", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "Internal Server Error"
    });
  }
};

// PATCH /api/v1/admin/orders/:id/status
const updateOrderStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: "Status is required"
      });
    }

    const result = await adminOrdersService.updateOrderStatus(id, status);

    res.status(result.status).send({
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error("admin-orders.controller.js->updateOrderStatusController", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "Internal Server Error"
    });
  }
};

// PATCH /api/v1/admin/orders/:id/payment-status
const updatePaymentStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!paymentStatus) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: "Payment status is required"
      });
    }

    const result = await adminOrdersService.updatePaymentStatus(id, paymentStatus);

    res.status(result.status).send({
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error("admin-orders.controller.js->updatePaymentStatusController", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "Internal Server Error"
    });
  }
};

// PATCH /api/v1/admin/orders/:id/tracking
const updateTrackingController = async (req, res) => {
  try {
    const { id } = req.params;
    const { trackingNumber } = req.body;

    if (!trackingNumber) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: "Tracking number is required"
      });
    }

    const result = await adminOrdersService.updateTrackingNumber(id, trackingNumber);

    res.status(result.status).send({
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error("admin-orders.controller.js->updateTrackingController", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "Internal Server Error"
    });
  }
};

// PATCH /api/v1/admin/orders/:id/notes
const updateOrderNotesController = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const result = await adminOrdersService.updateOrderNotes(id, notes);

    res.status(result.status).send({
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error("admin-orders.controller.js->updateOrderNotesController", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "Internal Server Error"
    });
  }
};

module.exports = {
  getOrdersController,
  getOrderByIdController,
  updateOrderStatusController,
  updatePaymentStatusController,
  updateTrackingController,
  updateOrderNotesController
};