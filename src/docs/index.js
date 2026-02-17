const fastify = require("fastify")({ logger: true });

async function buildServer() {

  // Register Swagger (OpenAPI)
  await fastify.register(require("@fastify/swagger"), {
    openapi: {
      info: {
        title: "TagCommics Website API",
        description: "API documentation of TagCommics E-Commerce Website",
        version: "1.0.0"
      },
      servers: [
        {
          url: "https://tagcommics-backend.railway.internal"
        }
      ]
    }
  });

  // Register Swagger UI
  await fastify.register(require("@fastify/swagger-ui"), {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false
    }
  });

  // Example route with schema
  fastify.get("/users", {
    schema: {
      description: "Get all users",
      tags: ["Users"],
      response: {
        200: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "number" },
              name: { type: "string" }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    return [{ id: 1, name: "Aahil" }];
  });

  return fastify;
}

buildServer().then(server => {
  server.listen({ port: 3000 }, err => {
    if (err) throw err;
  });
});
