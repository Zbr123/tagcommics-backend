const fastify = require('fastify')({
    logger: true
})

const cors = require('@fastify/cors')
const swagger = require('@fastify/swagger')
const swaggerUI = require('@fastify/swagger-ui')

const { routes } = require('./src/routes/main.routes')
const dotenv = require('dotenv')
const { syncModels } = require('./src/utils/sync-models')

dotenv.config()

const approvedDomains = [
  'http://localhost:3000',
  'https://tagcommics-website-next-production.up.railway.app'
];

fastify.register(require('@fastify/cors'), {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);

    const isAllowed = approvedDomains.some(domain =>
      origin.startsWith(domain)
    );

    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error("Not allowed by CORS"), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
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
