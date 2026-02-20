const fastify = require("fastify")({
  logger: true,
});
const swagger = require("@fastify/swagger");
const swaggerUI = require("@fastify/swagger-ui");

// Load models and associations before routes (so Comics has setCategories/setTags)
require("./src/models/associations");
const { routes } = require("./src/routes/main.routes");
const dotenv = require("dotenv");
const { syncModels } = require("./src/utils/sync-models");

dotenv.config();

fastify.register(require("@fastify/cors"), {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

// ✅ Register Swagger (OpenAPI spec generated from route schemas)
fastify.register(swagger, {
  openapi: {
    info: {
      title: "TagCommics API",
      version: "1.0.0",
      description: "API documentation for TagCommics E-Commerce backend. Use the routes below to try the API.",
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === "production"
            ? `https://tagcommics-backend.railway.internal`
            : `http://localhost:${process.env.PORT || 3000}`,
        description: process.env.NODE_ENV === "production" ? "Production" : "Local",
      },
    ],
    tags: [
      { name: "Auth", description: "Registration and login" },
      { name: "Comics", description: "Comic catalog" },
      { name: "Health", description: "API health check" },
    ],
  },
});

// ✅ Register Swagger UI (documentation at /docs)
fastify.register(swaggerUI, {
  routePrefix: "/docs",
  uiConfig: {
    docExpansion: "list",
    deepLinking: true,
    displayRequestDuration: true,
  },
});

// ✅ Register Routes
routes.forEach((route) => {
  route.url = `/api/v1${route.url.startsWith("/") ? route.url : "/" + route.url}`;
  fastify.route(route);
});

// Sync DB
syncModels();

// Start Server
fastify.listen(
  {
    port: process.env.PORT,
    host: process.env.SERVER_HOST,
  },
  (err, address) => {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    console.log(`Server running at ${address}`);
  },
);
