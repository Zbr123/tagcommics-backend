const { successResponse, errorResponse } = require("./base.schema")

const comicResponseSchema = {
    comic_id: { type: "string" },
    title: { type: "string" },
    slug: { type: "string" },
    currency: { type: "string" },
    author: { type: "string" },
    description: { type: "string" },
    issue_number: { type: "integer" },
    series_name: { type: "string" },
    price: { type: "number" },
    discounted_price: { type: "number" },
    cover_image_url: { type: "string" },
    digital_file_url: { type: "string" },
    is_digital: { type: "boolean" },
    is_physical: { type: "boolean" },
    stock_quantity: { type: "integer" },
    published_date: { type: "string" },
    rating: { type: "number" },
    sold_count: { type: "integer" },
    is_featured: { type: "boolean" },
    created_at: { type: "string" },
    categories: { type: "array", items: { type: "string" } },
    tags: { type: "array", items: { type: "string" } }
};

const createComicSchema = {
    summary: "Create a comic (Admin only)",
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
            discounted_price: { type: "number", default: 0 },
            cover_image: { type: "string", format: "binary" },
            digital_file: { type: "string", format: "binary" },
            is_digital: { type: "boolean", default: false },
            is_physical: { type: "boolean", default: true },
            stock_quantity: { type: "integer", default: 0 },
            published_date: { type: "string", format: "date" },
            rating: { type: "number", default: 0 },
            sold_count: { type: "integer", default: 0 },
            is_featured: { type: "boolean", default: false },
            slug: { type: "string" },
            category_ids: { type: "array", items: { type: "string", format: "uuid" } },
            tag_ids: { type: "array", items: { type: "string", format: "uuid" } }
        },
    },
    response: {
        201: successResponse({ type: "object", properties: comicResponseSchema }),
        500: errorResponse
    }
};

const getComicsSchema = {
    summary: "Get all comics (paginated)",
    tags: ["Comics"],
    querystring: {
        type: "object",
        properties: {
            page: { type: "integer", default: 1 },
            limit: { type: "integer", default: 20 }
        }
    },
    response: {
        200: successResponse({
            type: "object",
            properties: {
                comics: { type: "array", items: { type: "object", properties: comicResponseSchema } },
                pagination: {
                    type: "object",
                    properties: {
                        total: { type: "integer" },
                        page: { type: "integer" },
                        limit: { type: "integer" },
                        totalPages: { type: "integer" }
                    }
                }
            }
        }),
        404: errorResponse,
        500: errorResponse
    }
};

const getComicByIdSchema = {
    summary: "Get comic by ID",
    tags: ["Comics"],
    params: {
        type: "object",
        required: ["id"],
        properties: { id: { type: "string" } }
    },
    response: {
        200: successResponse({ type: "object", properties: comicResponseSchema }),
        404: errorResponse,
        500: errorResponse
    }
};

const getFeaturedComicsSchema = {
    summary: "Get featured comics",
    tags: ["Comics"],
    response: {
        200: successResponse({
            type: "array",
            items: { type: "object", properties: comicResponseSchema }
        }),
        500: errorResponse
    }
};

const getNewReleasesSchema = {
    summary: "Get new releases",
    tags: ["Comics"],
    querystring: {
        type: "object",
        properties: { limit: { type: "integer", default: 10 } }
    },
    response: {
        200: successResponse({
            type: "array",
            items: { type: "object", properties: comicResponseSchema }
        }),
        500: errorResponse
    }
};

const getBestSellersSchema = {
    summary: "Get best selling comics",
    tags: ["Comics"],
    querystring: {
        type: "object",
        properties: { limit: { type: "integer", default: 10 } }
    },
    response: {
        200: successResponse({
            type: "array",
            items: { type: "object", properties: comicResponseSchema }
        }),
        500: errorResponse
    }
};

const getByCategorySchema = {
    summary: "Get comics by category",
    tags: ["Comics"],
    params: {
        type: "object",
        required: ["category"],
        properties: { category: { type: "string" } }
    },
    querystring: {
        type: "object",
        properties: {
            page: { type: "integer", default: 1 },
            limit: { type: "integer", default: 20 }
        }
    },
    response: {
        200: successResponse({
            type: "object",
            properties: {
                category: { type: "string" },
                comics: { type: "array", items: { type: "object", properties: comicResponseSchema } },
                pagination: { type: "object" }
            }
        }),
        404: errorResponse,
        500: errorResponse
    }
};

const searchComicsSchema = {
    summary: "Search comics",
    tags: ["Comics"],
    querystring: {
        type: "object",
        required: ["q"],
        properties: {
            q: { type: "string" },
            page: { type: "integer", default: 1 },
            limit: { type: "integer", default: 20 }
        }
    },
    response: {
        200: successResponse({
            type: "object",
            properties: {
                query: { type: "string" },
                comics: { type: "array", items: { type: "object", properties: comicResponseSchema } },
                pagination: { type: "object" }
            }
        }),
        400: errorResponse,
        500: errorResponse
    }
};

const deleteComicSchema = {
    summary: "Delete comic (Admin only)",
    tags: ["Comics"],
    body: {
        type: "object",
        required: ["comic_id"],
        properties: { comic_id: { type: "string", format: "uuid" } }
    },
    response: {
        200: successResponse({ type: "object", properties: { message: { type: "string" } } }),
        404: errorResponse,
        500: errorResponse
    }
};

module.exports = {
    createComicSchema,
    getComicsSchema,
    getComicByIdSchema,
    getFeaturedComicsSchema,
    getNewReleasesSchema,
    getBestSellersSchema,
    getByCategorySchema,
    searchComicsSchema,
    deleteComicSchema
};