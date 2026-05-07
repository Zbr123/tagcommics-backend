const { StatusCodes } = require("http-status-codes");
const adminCustomersService = require("../services/admin-customers.service");

// GET /api/v1/admin/customers
const getCustomersController = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const result = await adminCustomersService.getCustomers({
      page: parseInt(page),
      limit: parseInt(limit),
      search
    });

    res.status(result.status).send({
      message: result.message,
      data: result.data.customers,
      pagination: result.data.pagination
    });
  } catch (error) {
    console.error("admin-customers.controller.js->getCustomersController", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "Internal Server Error"
    });
  }
};

// GET /api/v1/admin/customers/:id
const getCustomerByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminCustomersService.getCustomerById(id);

    res.status(result.status).send({
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error("admin-customers.controller.js->getCustomerByIdController", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "Internal Server Error"
    });
  }
};

module.exports = {
  getCustomersController,
  getCustomerByIdController
};