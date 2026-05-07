const { StatusCodes } = require("http-status-codes");
const adminDashboardService = require("../services/admin-dashboard.service");

// GET /api/v1/admin/dashboard/overview
const getDashboardOverviewController = async (req, res) => {
  try {
    const result = await adminDashboardService.getDashboardOverview();
    res.status(result.status).send({
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error("admin-dashboard.controller.js->getDashboardOverviewController", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "Internal Server Error"
    });
  }
};

// GET /api/v1/admin/dashboard/recent-orders
const getRecentOrdersController = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const result = await adminDashboardService.getRecentOrders({ limit: parseInt(limit) });
    res.status(result.status).send({
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error("admin-dashboard.controller.js->getRecentOrdersController", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "Internal Server Error"
    });
  }
};

// GET /api/v1/admin/dashboard/top-products
const getTopSellingProductsController = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const result = await adminDashboardService.getTopSellingProducts({ limit: parseInt(limit) });
    res.status(result.status).send({
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error("admin-dashboard.controller.js->getTopSellingProductsController", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "Internal Server Error"
    });
  }
};

// GET /api/v1/admin/dashboard/sales?period=week|month|year
const getSalesByPeriodController = async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    const result = await adminDashboardService.getSalesByPeriod({ period });
    res.status(result.status).send({
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error("admin-dashboard.controller.js->getSalesByPeriodController", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "Internal Server Error"
    });
  }
};

module.exports = {
  getDashboardOverviewController,
  getRecentOrdersController,
  getTopSellingProductsController,
  getSalesByPeriodController
};