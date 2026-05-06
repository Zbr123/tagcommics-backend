const { StatusCodes } = require("http-status-codes");
const Library = require("../models/library");

// Get user's library
const getLibrary = async (customerId) => {
  try {
    const library = await Library.findAll({
      where: { customer_id: customerId },
      order: [["purchased_at", "DESC"]],
    });

    return {
      status: StatusCodes.OK,
      message: "Library fetched successfully",
      data: library,
    };
  } catch (e) {
    console.error(e);
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: e.message,
    };
  }
};

// Check if user has access to specific item
const checkAccess = async (customerId, itemType, itemId) => {
  try {
    const libraryItem = await Library.findOne({
      where: {
        customer_id: customerId,
        item_type: itemType,
        [itemType === "comic" ? "comic_id" : "character_book_id"]: itemId,
      },
    });

    return {
      status: libraryItem ? StatusCodes.OK : StatusCodes.FORBIDDEN,
      hasAccess: !!libraryItem,
      data: libraryItem,
    };
  } catch (e) {
    console.error(e);
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: e.message,
    };
  }
};

module.exports = {
  getLibrary,
  checkAccess,
};