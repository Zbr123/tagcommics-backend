const { StatusCodes } = require("http-status-codes");
const designTeamService = require("../services/design-team.service");

// Submit contact form (public - server-to-server from Next)
const submitContactController = async (req, res) => {
  try {
    // Optional: Validate X-Design-Team-Secret header if configured
    const secret = process.env.DESIGN_TEAM_CONTACT_SECRET;
    if (secret) {
      const headerSecret = req.headers['x-design-team-secret'];
      if (headerSecret !== secret) {
        return res.status(StatusCodes.UNAUTHORIZED).send({
          message: "Invalid secret"
        });
      }
    }

    const result = await designTeamService.submitContact(req.body);
    res.status(result.status).send(result);
  } catch (error) {
    console.error("design-team.controller.js->submitContactController", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "Internal Server Error"
    });
  }
};

// Get all inquiries (admin only)
const getAllInquiriesController = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await designTeamService.getAllInquiries({
      page: parseInt(page),
      limit: parseInt(limit)
    });
    res.status(result.status).send(result);
  } catch (error) {
    console.error("design-team.controller.js->getAllInquiriesController", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "Internal Server Error"
    });
  }
};

// Get single inquiry (admin only)
const getInquiryByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await designTeamService.getInquiryById(id);
    res.status(result.status).send(result);
  } catch (error) {
    console.error("design-team.controller.js->getInquiryByIdController", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "Internal Server Error"
    });
  }
};

module.exports = {
  submitContactController,
  getAllInquiriesController,
  getInquiryByIdController
};