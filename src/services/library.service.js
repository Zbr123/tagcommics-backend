const { StatusCodes } = require("http-status-codes");
const Library = require("../models/library");
const path = require("path");

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
const checkAccess = async (customerId, pdf_url) => {
  try {
    // Normalize pdf_url - extract filename from full URL if present
    // Frontend sends: "http://localhost:5000/api/v1/uploads/comics/pdfs/xxx.pdf"
    // Database stores: "xxx.pdf"
    let normalizedPdfUrl = pdf_url;
    if (pdf_url && pdf_url.includes("/uploads/")) {
      normalizedPdfUrl = path.basename(pdf_url);
    }

    console.log(`Checking access for customer_id: ${customerId}, pdf_url: ${pdf_url} -> normalized: ${normalizedPdfUrl}`);

    const libraryItem = await Library.findOne({
      where: {
        customer_id: customerId,
        pdf_url: normalizedPdfUrl,
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