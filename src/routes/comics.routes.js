const comicController = require("../controllers/comic.controller");

const comicsRoutes = [
    {
        url: "/comics",
        method: "POST",
        handler: comicController.createComicController,
        schema: {
            summary: "Create a comic",
            tags: ["Comics"],
            body: {
                type: "object",
                required: ["title"],
                properties: {
                    title: { type: "string" },
                    currency: { type: "string", enum: ["USD", "PKR"], default: "USD" },
                    author: { type: "string" },
                    description: { type: "string" },
                    issue_number: { type: "integer" },
                    series_name: { type: "string" },
                    price: { type: "number", default: 0 },
                    discount: { type: "number", default: 0 },
                    cover_image_url: { type: "string" },
                    digital_file_url: { type: "string" },
                    is_digital: { type: "boolean", default: false },
                    is_physical: { type: "boolean", default: true },
                    stock_quantity: { type: "integer", default: 0 },
                    published_date: { type: "string", format: "date" },
                    rating: { type: "number", default: 0 },
                    sold_count: { type: "integer", default: 0 },
                    category_ids: {
                        type: "array",
                        items: { type: "string", format: "uuid" },
                    },
                    tag_ids: {
                        type: "array",
                        items: { type: "string", format: "uuid" },
                    },
                },
            },
            response: {
                201: {
                    type: "object",
                    properties: {
                        status: { type: "number", example: 201 },
                        message: { type: "string" },
                        data: { type: "object" },
                    },
                },
                500: {},
            },
        }
    }
];

module.exports = comicsRoutes;
