const fastify = require("fastify")({ logger: true });
const swagger = require("@fastify/swagger");
const swaggerUI = require("@fastify/swagger-ui");
const cors = require("@fastify/cors");
const multipart = require("@fastify/multipart");
const fastifyStatic = require("@fastify/static");

const { routes } = require("./src/routes/main.routes");
const { comic_pdf_path } = require("./uploads");

async function buildApp() {
  // CORS
  await fastify.register(cors, {
    origin: "*",
  });

  // Swagger
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: "TagCommics API",
        version: "1.0.0",
      },
    },
  });

  await fastify.register(swaggerUI, {
    routePrefix: "/docs",
  });

  // Multipart
  await fastify.register(multipart, {
    limits: { fileSize: 40 * 1024 * 1024 },
  });

  // Static
  await fastify.register(fastifyStatic, {
    root: comic_pdf_path,
    prefix: "/api/v1/uploads/comic/",
  });
  
  // Routes
  routes.forEach((route) => {
    route.url = `/api/v1${route.url.startsWith("/") ? route.url : "/" + route.url}`;
    fastify.route(route);
  });

  return fastify;
}

module.exports = buildApp;