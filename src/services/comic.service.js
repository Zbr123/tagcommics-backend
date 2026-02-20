const { StatusCodes } = require("http-status-codes");
const { Comics } = require("../models/comics");

const createComic = async (payload) => {
    try {
        const {
            title,
            currency,
            author,
            description,
            issue_number,
            series_name,
            price,
            discount,
            cover_image_url,
            digital_file_url,
            is_digital,
            is_physical,
            stock_quantity,
            published_date,
            rating,
            sold_count,
            category_ids = [],
            tag_ids = []
        } = payload;

        const comic = await Comics.create({
            title,
            currency: currency || "USD",
            author,
            description,
            issue_number,
            series_name,
            price: price ?? 0,
            discount: discount ?? 0,
            cover_image_url,
            digital_file_url,
            is_digital: is_digital ?? false,
            is_physical: is_physical ?? true,
            stock_quantity: stock_quantity ?? 0,
            published_date,
            rating: rating ?? 0,
            sold_count: sold_count ?? 0
        });

        if (category_ids && category_ids.length > 0) {
            await comic.setCategories(category_ids);
        }
        if (tag_ids && tag_ids.length > 0) {
            await comic.setTags(tag_ids);
        }

        const comicWithAssociations = await Comics.findByPk(comic.comic_id, {
            include: ["Categories", "Tags"]
        });

        const data = comicWithAssociations
            ? comicWithAssociations.toJSON()
            : comic.toJSON();

        return {
            status: StatusCodes.CREATED,
            message: "Comic created successfully",
            data
        };
    } catch (e) {
        console.error(e);
        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Error creating comic: " + (e.message || String(e))
        };
    }
};

module.exports = { createComic };
