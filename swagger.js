const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TagCommics Website Documentation",
      version: "1.0.0",
      description: "API documentation",
    },
    servers: [
      {
        url: "https://tagcommics-backend.railway.internal",
      },
    ],
  },
  apis: ["./src/routes/*.js"], // path to route files
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
