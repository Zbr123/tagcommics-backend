const baseResponse = {
  type: "object",
  properties: {
    status: { type: "number" },
    message: { type: "string" }
  }
};

const successResponse = (dataSchema) => ({
  ...baseResponse,
  properties: {
    ...baseResponse.properties,
    data: dataSchema
  }
});

const errorResponse = {
  type: "object",
  properties: {
    status: { type: "number" },
    message: { type: "string" },
    error: { type: "string" }
  }
};

module.exports = {
  successResponse,
  errorResponse
};