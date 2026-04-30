const testController = require("../controllers/test.controller");

const testRoute = [
    {
        url: '/',
        method: 'GET',
        handler: testController.testController,
        schema: {
            summary: "Health check",
            tags: ["Health"],
            response: {
                200: {
                    type: "object",
                    properties: {
                        message: { type: "string" },
                    },
                },
            },
        },
    },
];

module.exports = testRoute;