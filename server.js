const fastify = require('fastify')({
    logger: true
})
const swagger = require('@fastify/swagger')
const swaggerUI = require('@fastify/swagger-ui')

const { routes } = require('./src/routes/main.routes')
const dotenv = require('dotenv')
const { syncModels } = require('./src/utils/sync-models')

dotenv.config()

fastify.register(require('@fastify/cors'), {
  origin: "*",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});


// ✅ Register Swagger
fastify.register(swagger, {
    openapi: {
        info: {
            title: "TagCommics Website Documentation",
            version: "1.0.0",
            description: "API documentation",
        },
        servers: [
            {
                url: `https://tagcommics-backend.railway.internal`
            }
        ]
    }
})

// ✅ Register Swagger UI (only in development)
if (process.env.NODE_ENV !== 'production') {
    fastify.register(swaggerUI, {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: false
        }
    })
}

// ✅ Register Routes
routes.forEach(route => {
    route.url = `/api/v1${route.url.startsWith('/') ? route.url : '/' + route.url}`
    fastify.route(route)
})

// Sync DB
syncModels()

// Start Server
fastify.listen({
    port: process.env.PORT,
    host: process.env.SERVER_HOST,
}, (err, address) => {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
    console.log(`Server running at ${address}`)
})
