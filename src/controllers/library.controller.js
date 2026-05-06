const { StatusCodes } = require("http-status-codes");
const libraryService = require("../services/library.service");

// Get user's library
const getLibraryController = async (req, res) => {
  try {
    const customerId = req.user.user_id;
    const result = await libraryService.getLibrary(customerId);
    res.status(result.status).send({
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("library.controller.js->getLibraryController", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "Internal Server Error",
    });
  }
};

// Check access to specific item
const checkAccessController = async (req, res) => {
  try {
    const customerId = req.user.user_id;
    const { item_type, item_id } = req.query;

    if (!item_type || !item_id) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: "item_type and item_id are required",
      });
    }

    const result = await libraryService.checkAccess(customerId, item_type, item_id);
    res.status(result.status).send({
      message: result.hasAccess ? "Access granted" : "Access denied",
      hasAccess: result.hasAccess,
      data: result.data,
    });
  } catch (error) {
    console.error("library.controller.js->checkAccessController", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  getLibraryController,
  checkAccessController,
};