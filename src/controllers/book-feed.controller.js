const { StatusCodes } = require("http-status-codes");
const characterService = require("../services/character.service");

// Get latest releases (New Item books)
const getLatestReleasesController = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    const result = await characterService.getLatestReleasesService({ limit: parseInt(limit) });
    res.status(result.status).send({ message: result.message, data: result.data });
  } catch (error) {
    console.error("character.controller.js->getLatestReleasesController", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal Server Error" });
  }
};

// Get flash sale books
const getFlashSaleController = async (req, res) => {
  try {
    const { limit = 12 } = req.query;
    const result = await characterService.getFlashSaleService({ limit: parseInt(limit) });
    res.status(result.status).send({ message: result.message, data: result.data });
  } catch (error) {
    console.error("character.controller.js->getFlashSaleController", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal Server Error" });
  }
};

// Get popular books
const getPopularBooksController = async (req, res) => {
  try {
    const { limit = 12 } = req.query;
    const result = await characterService.getPopularBooksService({ limit: parseInt(limit) });
    res.status(result.status).send({ message: result.message, data: result.data });
  } catch (error) {
    console.error("character.controller.js->getPopularBooksController", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal Server Error" });
  }
};

// Get all books (browse)
const getAllBooksController = async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const result = await characterService.getAllBooksService({ limit: parseInt(limit), page: parseInt(page) });
    res.status(result.status).send({ message: result.message, data: result.data });
  } catch (error) {
    console.error("character.controller.js->getAllBooksController", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal Server Error" });
  }
};

module.exports = {
  getLatestReleasesController,
  getFlashSaleController,
  getPopularBooksController,
  getAllBooksController
};