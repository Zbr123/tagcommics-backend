const { StatusCodes } = require("http-status-codes");
const { Comics } = require("../models/comics");
const { Category } = require("../models/categories");
const { Tag } = require("../models/tags");
const { deleteFile } = require("../utils/delete-file");
const path = require('path');
const { Op } = require("sequelize");

// Helper to format comic response
const formatComic = (comic) => {
    const data = comic.toJSON ? comic.toJSON() : comic;
    return {
        comic_id: data.comic_id,
        title: data.title,
        slug: data.slug,
        currency: data.currency,
        author: data.author,
        description: data.description,
        issue_number: data.issue_number,
        series_name: data.series_name,
        price: parseFloat(data.price),
        discounted_price: parseFloat(data.discounted_price || 0),
        cover_image_url: data.cover_image_url,
        digital_file_url: data.digital_file_url,
        is_digital: data.is_digital,
        is_physical: data.is_physical,
        stock_quantity: data.stock_quantity,
        published_date: data.published_date,
        rating: parseFloat(data.rating || 0),
        sold_count: data.sold_count,
        is_featured: data.is_featured,
        created_at: data.created_at,
        categories: data.categories ? data.categories.map(c => c.name) : [],
        tags: data.tags ? data.tags.map(t => t.name) : []
    };
};

const createComic = async ({ ...fields }) => {
    try {
        const comic = await Comics.create({
            title: fields.title,
            currency: fields.currency || "USD",
            author: fields.author,
            description: fields.description,
            issue_number: fields.issue_number,
            series_name: fields.series_name,
            price: fields.price ?? 0,
            discounted_price: fields.discounted_price ?? 0,
            cover_image_url: fields.cover_image_url,
            digital_file_url: fields.digital_file_url,
            is_digital: fields.is_digital ?? false,
            is_physical: fields.is_physical ?? true,
            stock_quantity: fields.stock_quantity ?? 0,
            published_date: fields.published_date,
            rating: fields.rating ?? 0,
            sold_count: fields.sold_count ?? 0,
            slug: fields.slug || fields.title.toLowerCase().replace(/\s+/g, '-'),
            is_featured: fields.is_featured ?? false,
            created_by: fields.created_by
        });

        // Handle category association
        if (fields.category_ids && fields.category_ids.length > 0) {
            const categories = await Category.findAll({
                where: { category_id: fields.category_ids }
            });
            await comic.addCategories(categories);
        }

        // Handle tag association
        if (fields.tag_ids && fields.tag_ids.length > 0) {
            const tags = await Tag.findAll({
                where: { tag_id: fields.tag_ids }
            });
            await comic.addTags(tags);
        }

        // Reload with associations
        const comicWithRelations = await Comics.findByPk(comic.comic_id, {
            include: [Category, Tag]
        });

        return {
            status: StatusCodes.CREATED,
            message: "Comic created successfully",
            data: formatComic(comicWithRelations)
        };

    } catch (e) {
        console.error(e);
        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: e.message
        };
    }
};

const getComics = async ({ page = 1, limit = 20 } = {}) => {
    try {
        const offset = (page - 1) * limit;

        const { count, rows } = await Comics.findAndCountAll({
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: [Category, Tag],
            order: [['created_at', 'DESC']]
        });

        return {
            status: StatusCodes.OK,
            message: "Comics fetched successfully",
            data: {
                comics: rows.map(formatComic),
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
                }
            }
        };

    } catch (e) {
        console.error(e);
        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: e.message
        };
    }
};

const getComicById = async (comicId) => {
    try {
        const comic = await Comics.findByPk(comicId, {
            include: [Category, Tag, { model: require("../models/user"), as: "creator", attributes: ["user_id", "name", "email"] }]
        });

        if (!comic) {
            return {
                status: StatusCodes.NOT_FOUND,
                message: "Comic not found"
            };
        }

        return {
            status: StatusCodes.OK,
            message: "Comic fetched successfully",
            data: formatComic(comic)
        };

    } catch (e) {
        console.error(e);
        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: e.message
        };
    }
};

const getFeaturedComics = async () => {
    try {
        // First try is_featured flag
        let comics = await Comics.findAll({
            where: { is_featured: true },
            include: [Category, Tag],
            order: [['created_at', 'DESC']],
            limit: 6
        });

        // Fallback to latest 6 if no featured found
        if (comics.length === 0) {
            comics = await Comics.findAll({
                include: [Category, Tag],
                order: [['created_at', 'DESC']],
                limit: 6
            });
        }

        return {
            status: StatusCodes.OK,
            message: "Featured comics fetched successfully",
            data: comics.map(formatComic)
        };

    } catch (e) {
        console.error(e);
        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: e.message
        };
    }
};

const getNewReleases = async ({ limit = 10 } = {}) => {
    try {
        const comics = await Comics.findAll({
            include: [Category, Tag],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit)
        });

        return {
            status: StatusCodes.OK,
            message: "New releases fetched successfully",
            data: comics.map(formatComic)
        };

    } catch (e) {
        console.error(e);
        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: e.message
        };
    }
};

const getBestSellers = async ({ limit = 10 } = {}) => {
    try {
        // Use sold_count for best sellers, fallback to rating
        const comics = await Comics.findAll({
            include: [Category, Tag],
            order: [
                ['sold_count', 'DESC'],
                ['rating', 'DESC']
            ],
            limit: parseInt(limit)
        });

        return {
            status: StatusCodes.OK,
            message: "Best sellers fetched successfully",
            data: comics.map(formatComic)
        };

    } catch (e) {
        console.error(e);
        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: e.message
        };
    }
};

const getByCategory = async (categorySlug, { page = 1, limit = 20 } = {}) => {
    try {
        const offset = (page - 1) * limit;

        // Find category by name/slug
        const category = await Category.findOne({
            where: {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${categorySlug}%` } },
                    { slug: categorySlug }
                ]
            }
        });

        if (!category) {
            return {
                status: StatusCodes.NOT_FOUND,
                message: "Category not found"
            };
        }

        // Find comics through junction table
        const { count, rows } = await Comics.findAndCountAll({
            include: [{
                model: Category,
                where: { category_id: category.category_id }
            }, Tag],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        return {
            status: StatusCodes.OK,
            message: `Comics in ${category.name} fetched successfully`,
            data: {
                category: category.name,
                comics: rows.map(formatComic),
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
                }
            }
        };

    } catch (e) {
        console.error(e);
        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: e.message
        };
    }
};

const searchComics = async ({ q, page = 1, limit = 20 } = {}) => {
    try {
        if (!q || q.trim() === '') {
            return {
                status: StatusCodes.BAD_REQUEST,
                message: "Search query is required"
            };
        }

        const offset = (page - 1) * limit;
        const searchTerm = `%${q.trim()}%`;

        const { count, rows } = await Comics.findAndCountAll({
            where: {
                [Op.or]: [
                    { title: { [Op.iLike]: searchTerm } },
                    { author: { [Op.iLike]: searchTerm } },
                    { description: { [Op.iLike]: searchTerm } },
                    { series_name: { [Op.iLike]: searchTerm } }
                ]
            },
            include: [Category, Tag],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['rating', 'DESC'], ['sold_count', 'DESC']]
        });

        return {
            status: StatusCodes.OK,
            message: `Search results for "${q}"`,
            data: {
                query: q,
                comics: rows.map(formatComic),
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
                }
            }
        };

    } catch (e) {
        console.error(e);
        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: e.message
        };
    }
};


const getComicsByCharacter = async (character_id) => {
  try {
    const comics = await Comics.findAll({
      where: {
        characters: {
          [Op.contains]: [character_id]
        }
      }
    });

    if (comics.length === 0) {
      return {
        status: StatusCodes.NOT_FOUND,
        message: "Comics not found"
      };
    }

    return {
      status: StatusCodes.OK,
      message: "Comics fetched successfully",
      data: comics
    };

    } catch (e) {
        console.error(e);
        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: e.message
        };
    }
};

const deleteComic = async (comicId) => {
    try {
        const comic = await Comics.findByPk(comicId);

        if (!comic) {
            return {
                status: StatusCodes.NOT_FOUND,
                message: "Comic not found"
            };
        }

        // Delete associated files
        if (comic.cover_image_url) {
            const imagePath = path.join(process.cwd(), `src/uploads/comics/images/${comic.cover_image_url}`);
            deleteFile(imagePath);
        }
        if (comic.digital_file_url) {
            const pdfPath = path.join(process.cwd(), `src/uploads/comics/pdfs/${comic.digital_file_url}`);
            deleteFile(pdfPath);
        }

        await comic.destroy();

        return {
            status: StatusCodes.OK,
            message: "Comic deleted successfully"
        };

    } catch (e) {
        console.error(e);
        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: e.message
        };
    }
};

module.exports = {
    createComic,
    getComics,
    getComicById,
    getFeaturedComics,
    getNewReleases,
    getBestSellers,
    getByCategory,
    searchComics,
    getComicsByCharacter, deleteComic
};