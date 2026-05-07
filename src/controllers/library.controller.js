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
    const { pdf_url } = req.query;

    if (!pdf_url) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: "pdf_url is required",
      });
    }

    const result = await libraryService.checkAccess(customerId, pdf_url);
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