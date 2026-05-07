const { StatusCodes } = require("http-status-codes");

const validateContactRequest = async (req, reply) => {
  const body = req.body || {};
  const { firstName, lastName, email, phone, message, acceptPolicy } = body;
  const errors = [];

  if (!firstName || typeof firstName !== 'string' || firstName.trim() === '') {
    errors.push("firstName is required");
  }

  if (!lastName || typeof lastName !== 'string' || lastName.trim() === '') {
    errors.push("lastName is required");
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    errors.push("valid email is required");
  }

  if (!phone || typeof phone !== 'string' || phone.trim() === '') {
    errors.push("phone is required");
  }

  if (!message || typeof message !== 'string' || message.trim() === '') {
    errors.push("message is required");
  }

  if (acceptPolicy !== true) {
    errors.push("acceptPolicy must be true");
  }

  if (errors.length > 0) {
    return reply.code(StatusCodes.BAD_REQUEST).send({
      message: "Validation failed",
      errors
    });
  }
};

module.exports = { validateContactRequest };