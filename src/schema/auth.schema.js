const { errorResponse, successResponse } = require("./base.schema");

const loginSchema = {
  summary: "User Login",
  tags: ["Auth"],
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 6 },
    },
  },
  response: {
    200: successResponse({
      type: "object",
      properties: {
        access_token: { type: "string" },
        is_admin: { type: "boolean" },
        user: {
          type: "object",
          properties: {
            user_id: { type: "string" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            phone: { type: "string" },
            user_role: { type: "string", enum: ["customer", "admin"] },
          },
        },
      },
    }),
    401: errorResponse,
    500: errorResponse,
  },
};

const signupSchema = {
  summary: "User Registration",
  tags: ["Auth"],
  body: {
    type: "object",
    required: ["name", "email", "password"],
    properties: {
      name: { type: "string" },
      email: { type: "string", format: "email" },
      password: { type: "string" },
      phone: { type: "string" },
      userRole: { type: "string", enum: ["customer", "admin"] },
    },
  },
  response: {
    201: successResponse({
      type: "object",
      properties: {
        message: { type: "string" },
      },
    }),
    401: errorResponse,
    500: errorResponse,
  },
};

module.exports = { loginSchema, signupSchema };
