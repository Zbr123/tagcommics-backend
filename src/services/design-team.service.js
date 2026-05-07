const { StatusCodes } = require("http-status-codes");
const DesignTeamInquiry = require("../models/design_team_inquiry");
const { Op } = require("sequelize");

// Validate contact form data
const validateContactData = (data) => {
  const errors = [];

  if (!data.firstName || typeof data.firstName !== 'string' || data.firstName.trim() === '') {
    errors.push("firstName is required");
  }

  if (!data.lastName || typeof data.lastName !== 'string' || data.lastName.trim() === '') {
    errors.push("lastName is required");
  }

  if (!data.email || typeof data.email !== 'string' || !data.email.includes('@')) {
    errors.push("valid email is required");
  }

  if (!data.phone || typeof data.phone !== 'string' || data.phone.trim() === '') {
    errors.push("phone is required");
  }

  if (!data.message || typeof data.message !== 'string' || data.message.trim() === '') {
    errors.push("message is required");
  }

  if (data.acceptPolicy !== true) {
    errors.push("acceptPolicy must be true");
  }

  return errors;
};

// Submit design team contact inquiry
const submitContact = async (data) => {
  try {
    // Validate
    const errors = validateContactData(data);
    if (errors.length > 0) {
      return {
        status: StatusCodes.BAD_REQUEST,
        message: "Validation failed",
        errors
      };
    }

    // Create inquiry
    const inquiry = await DesignTeamInquiry.create({
      first_name: data.firstName.trim(),
      last_name: data.lastName.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone ? data.phone.trim() : null,
      company_name: data.companyName ? data.companyName.trim() : null,
      message: data.message.trim(),
      source: data.source || null,
      submitted_at: data.submittedAt ? new Date(data.submittedAt) : new Date()
    });

    // TODO: Send admin notification (email/Slack webhook) here if configured
    // Example: await sendAdminNotification(inquiry);

    return {
      status: StatusCodes.CREATED,
      message: "Inquiry submitted successfully",
      data: { id: inquiry.id }
    };
  } catch (e) {
    console.error(e);
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: e.message
    };
  }
};

// Get all inquiries (admin)
const getAllInquiries = async ({ page = 1, limit = 20 } = {}) => {
  try {
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await DesignTeamInquiry.findAndCountAll({
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    return {
      status: StatusCodes.OK,
      message: "Inquiries fetched successfully",
      data: {
        inquiries: rows.map(formatInquiry),
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    };
  } catch (e) {
    console.error(e);
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: e.message
    };
  }
};

// Get single inquiry by ID (admin)
const getInquiryById = async (id) => {
  try {
    const inquiry = await DesignTeamInquiry.findByPk(id);

    if (!inquiry) {
      return {
        status: StatusCodes.NOT_FOUND,
        message: "Inquiry not found"
      };
    }

    return {
      status: StatusCodes.OK,
      message: "Inquiry fetched successfully",
      data: formatInquiry(inquiry)
    };
  } catch (e) {
    console.error(e);
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: e.message
    };
  }
};

// Format inquiry for response
const formatInquiry = (inquiry) => {
  const data = inquiry.toJSON ? inquiry.toJSON() : inquiry;
  return {
    id: data.id,
    created_at: data.created_at,
    first_name: data.first_name,
    last_name: data.last_name,
    company_name: data.company_name,
    email: data.email,
    phone: data.phone,
    message: data.message,
    source: data.source,
    submitted_at: data.submitted_at
  };
};

module.exports = {
  submitContact,
  getAllInquiries,
  getInquiryById,
  validateContactData
};