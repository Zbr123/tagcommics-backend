const { successResponse, errorResponse } = require("./base.schema")

const createComicSchema = {
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
            cover_image: { type: "string", format: "binary" },
            digital_file: { type: "string", format: "binary" },
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
        201: successResponse({
            type: "object",
            properties: {
                status: { type: "number", example: 201 },
                message: { type: "string" },
                data: { type: "object" },
            },
        }),
        500: errorResponse,
    },
}