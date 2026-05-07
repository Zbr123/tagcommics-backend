const { StatusCodes } = require("http-status-codes");
const ComicCharacter = require("../models/comic_characters");
const CharacterBook = require("../models/character_book");
const { Comics } = require("../models/comics");
const { sequelize } = require("../../config/pg-config");
const { Op } = require("sequelize");

// Valid book types
const BOOK_TYPES = ['Physical', 'E-book', 'Sale', 'Flash Sale', 'New Item'];

// Normalize book_type to canonical enum value
const normalizeBookType = (bookType) => {
    if (!bookType) return null;

    const mapping = {
        'ebook': 'E-book',
        'e-book': 'E-book',
        'ebook': 'E-book',
        'physical': 'Physical',
        'sale': 'Sale',
        'flashsale': 'Flash Sale',
        'flash-sale': 'Flash Sale',
        'flash_sale': 'Flash Sale',
        'newitem': 'New Item',
        'new-item': 'New Item',
        'new_item': 'New Item'
    };

    const normalized = String(bookType).toLowerCase().replace(/[\s_-]/g, '');
    return mapping[normalized] || bookType;
};

// Validate and normalize book data
const normalizeBookData = (bookData, isUpdate = false) => {
    const normalized = {};

    // title - required for create
    if (bookData.title !== undefined) {
        normalized.title = String(bookData.title).trim();
    }

    // author
    if (bookData.author !== undefined) {
        normalized.author = bookData.author ? String(bookData.author).trim() : null;
    }

    // category
    if (bookData.category !== undefined) {
        normalized.category = bookData.category ? String(bookData.category).trim() : null;
    }

    // original_price
    if (bookData.original_price !== undefined) {
        const price = parseFloat(bookData.original_price);
        normalized.original_price = isNaN(price) ? 0 : Math.abs(price);
    }

    // discounted_price
    if (bookData.discounted_price !== undefined) {
        const price = parseFloat(bookData.discounted_price);
        normalized.discounted_price = isNaN(price) ? 0 : Math.abs(price);
    }

    // Ensure discounted_price <= original_price
    if (normalized.original_price && normalized.discounted_price) {
        if (normalized.discounted_price > normalized.original_price) {
            normalized.discounted_price = normalized.original_price;
        }
    }

    // stock
    if (bookData.stock !== undefined) {
        const stock = parseInt(bookData.stock);
        normalized.stock = isNaN(stock) ? 0 : Math.max(0, stock);
    }

    // tags - store as string, accept array or comma-separated
    if (bookData.tags !== undefined) {
        if (Array.isArray(bookData.tags)) {
            normalized.tags = bookData.tags.join(',');
        } else if (bookData.tags) {
            normalized.tags = String(bookData.tags).trim();
        } else {
            normalized.tags = null;
        }
    }

    // book_type - normalize to canonical enum
    if (bookData.book_type !== undefined) {
        normalized.book_type = normalizeBookType(bookData.book_type);
        // Validate it's a valid enum value
        if (normalized.book_type && !BOOK_TYPES.includes(normalized.book_type)) {
            normalized.book_type = null;
        }
    }

    // review - constrain to 0..5
    if (bookData.review !== undefined) {
        const review = parseFloat(bookData.review);
        if (!isNaN(review)) {
            normalized.review = Math.max(0, Math.min(5, review));
        }
    }

    // image - file path from controller
    if (bookData.image !== undefined) {
        normalized.image = bookData.image || null;
    }

    // pdf_file - file path from controller
    if (bookData.pdf_file !== undefined) {
        normalized.pdf_file = bookData.pdf_file || null;
    }

    // comic_id
    if (bookData.comic_id !== undefined) {
        normalized.comic_id = bookData.comic_id || null;
    }

    return normalized;
};

// Format book for API response
const formatBookResponse = (book) => {
    const data = book.toJSON ? book.toJSON() : book;
    return {
        id: data.id,
        character_id: data.character_id,
        title: data.title,
        author: data.author,
        category: data.category,
        original_price: parseFloat(data.original_price || 0),
        discounted_price: parseFloat(data.discounted_price || 0),
        stock: data.stock || 0,
        tags: data.tags || '',
        book_type: data.book_type,
        review: parseFloat(data.review || 0),
        image_url: data.image ? `/api/v1/uploads/comics/images/${data.image}` : null,
        pdf_url: data.pdf_file ? `/api/v1/uploads/comics/pdfs/${data.pdf_file}` : null,
        created_at: data.created_at,
        updated_at: data.updated_at
    };
};

// Format books array for response
const formatBooksArray = (books) => {
    return books.map(formatBookResponse);
};

// Get all characters with formatted books
const getAllCharactersService = async () => {
    try {
        const characters = await ComicCharacter.findAll({
            include: [{
                model: CharacterBook,
                as: 'books',
                order: [['created_at', 'DESC']]
            }]
        });

        if (characters.length === 0) {
            return {
                status: StatusCodes.NOT_FOUND,
                message: "No characters found",
                data: []
            };
        }

        // Format response with normalized books
        const formattedCharacters = characters.map(char => {
            const charData = char.toJSON ? char.toJSON() : char;
            return {
                ...charData,
                books: formatBooksArray(charData.books || [])
            };
        });

        return {
            status: StatusCodes.OK,
            message: "Characters fetched successfully",
            data: formattedCharacters
        };

    } catch (e) {
        console.error(e);
        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: e.message
        };
    }
};

// Get character by ID with formatted books
const getCharacterByIdService = async (character_id) => {
    try {
        const character = await ComicCharacter.findOne({
            where: { character_id },
            include: [{
                model: CharacterBook,
                as: 'books',
                order: [['created_at', 'DESC']]
            }]
        });

        if (!character) {
            return {
                status: StatusCodes.NOT_FOUND,
                message: "Character not found"
            };
        }

        const charData = character.toJSON ? character.toJSON() : character;
        return {
            status: StatusCodes.OK,
            message: "Character fetched successfully",
            data: {
                ...charData,
                books: formatBooksArray(charData.books || [])
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

const createCharacterService = async (characterData) => {
    try {
        const newCharacter = await ComicCharacter.create(characterData);
        return {
            status: StatusCodes.CREATED,
            message: "Character created successfully",
            data: newCharacter
        };
    } catch (e) {
        console.error(e);
        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: e.message
        };
    }
};

const updateCharacterService = async (character_id, characterData) => {
    try {
        const character = await ComicCharacter.findOne({ where: { character_id } });
        if (!character) {
            return {
                status: StatusCodes.NOT_FOUND,
                message: "Character not found"
            };
        }

        await character.update(characterData);
        return {
            status: StatusCodes.OK,
            message: "Character updated successfully",
            data: character
        };
    } catch (e) {
        console.error(e);
        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: e.message
        };
    }
};

// Add a book to character
const addBookToCharacterService = async (character_id, bookData) => {
    try {
        const character = await ComicCharacter.findOne({ where: { character_id } });
        if (!character) {
            return {
                status: StatusCodes.NOT_FOUND,
                message: "Character not found"
            };
        }

        if (bookData.comic_id) {
            const comic = await Comics.findByPk(bookData.comic_id);
            if (!comic) {
                return {
                    status: StatusCodes.NOT_FOUND,
                    message: "Comic not found"
                };
            }
        }

        // Normalize the book data
        const normalized = normalizeBookData(bookData);

        const newBook = await CharacterBook.create({
            character_id,
            comic_id: normalized.comic_id || null,
            title: normalized.title,
            author: normalized.author,
            category: normalized.category,
            original_price: normalized.original_price ?? 0,
            discounted_price: normalized.discounted_price ?? 0,
            stock: normalized.stock ?? 0,
            tags: normalized.tags,
            image: normalized.image,
            book_type: normalized.book_type,
            pdf_file: normalized.pdf_file,
            review: normalized.review ?? 0
        });

        const updatedCharacter = await ComicCharacter.findOne({
            where: { character_id },
            include: [{ model: CharacterBook, as: 'books' }]
        });

        const charData = updatedCharacter.toJSON ? updatedCharacter.toJSON() : updatedCharacter;
        return {
            status: StatusCodes.CREATED,
            message: "Book added to character successfully",
            data: {
                ...charData,
                books: formatBooksArray(charData.books || [])
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

// Add multiple books to character
const addBooksToCharacterService = async (character_id, booksArray) => {
    try {
        const character = await ComicCharacter.findOne({ where: { character_id } });
        if (!character) {
            return {
                status: StatusCodes.NOT_FOUND,
                message: "Character not found"
            };
        }

        const createdBooks = await Promise.all(
            booksArray.map(book => {
                const normalized = normalizeBookData(book);
                return CharacterBook.create({
                    character_id,
                    comic_id: normalized.comic_id || null,
                    title: normalized.title,
                    author: normalized.author,
                    category: normalized.category,
                    original_price: normalized.original_price ?? 0,
                    discounted_price: normalized.discounted_price ?? 0,
                    stock: normalized.stock ?? 0,
                    tags: normalized.tags,
                    image: normalized.image,
                    book_type: normalized.book_type,
                    pdf_file: normalized.pdf_file,
                    review: normalized.review ?? 0
                });
            })
        );

        const updatedCharacter = await ComicCharacter.findOne({
            where: { character_id },
            include: [{ model: CharacterBook, as: 'books' }]
        });

        const charData = updatedCharacter.toJSON ? updatedCharacter.toJSON() : updatedCharacter;
        return {
            status: StatusCodes.CREATED,
            message: "Books added to character successfully",
            data: {
                ...charData,
                books: formatBooksArray(charData.books || [])
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

// Remove a book from character
const removeBookFromCharacterService = async (character_id, bookId) => {
    try {
        const character = await ComicCharacter.findOne({ where: { character_id } });
        if (!character) {
            return {
                status: StatusCodes.NOT_FOUND,
                message: "Character not found"
            };
        }

        const book = await CharacterBook.findOne({
            where: { id: bookId, character_id }
        });

        if (!book) {
            return {
                status: StatusCodes.NOT_FOUND,
                message: "Book not found for this character"
            };
        }

        await book.destroy();

        const updatedCharacter = await ComicCharacter.findOne({
            where: { character_id },
            include: [{ model: CharacterBook, as: 'books' }]
        });

        const charData = updatedCharacter.toJSON ? updatedCharacter.toJSON() : updatedCharacter;
        return {
            status: StatusCodes.OK,
            message: "Book removed from character successfully",
            data: {
                ...charData,
                books: formatBooksArray(charData.books || [])
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

// Update a specific book
const updateBookService = async (character_id, bookId, bookData) => {
    try {
        const character = await ComicCharacter.findOne({ where: { character_id } });
        if (!character) {
            return {
                status: StatusCodes.NOT_FOUND,
                message: "Character not found"
            };
        }

        const book = await CharacterBook.findOne({
            where: { id: bookId, character_id }
        });

        if (!book) {
            return {
                status: StatusCodes.NOT_FOUND,
                message: "Book not found"
            };
        }

        // Normalize the update data
        const normalized = normalizeBookData(bookData, true);
        await book.update(normalized);

        return {
            status: StatusCodes.OK,
            message: "Book updated successfully",
            data: formatBookResponse(book)
        };
    } catch (e) {
        console.error(e);
        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: e.message
        };
    }
};

// Get single book
const getBookByIdService = async (character_id, bookId) => {
    try {
        const book = await CharacterBook.findOne({
            where: { id: bookId, character_id }
        });

        if (!book) {
            return {
                status: StatusCodes.NOT_FOUND,
                message: "Book not found"
            };
        }

        return {
            status: StatusCodes.OK,
            message: "Book fetched successfully",
            data: formatBookResponse(book)
        };
    } catch (e) {
        console.error(e);
        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: e.message
        };
    }
};

// ============ BOOK FEED SERVICES ============

// Latest Releases - book_type = 'New Item', sorted by created_at DESC
const getLatestReleasesService = async ({ limit = 8 } = {}) => {
    try {
        const books = await CharacterBook.findAll({
            where: { book_type: 'New Item' },
            order: [['created_at', 'DESC']],
            limit: parseInt(limit)
        });

        return {
            status: StatusCodes.OK,
            message: "Latest releases fetched successfully",
            data: formatBooksArray(books)
        };
    } catch (e) {
        console.error(e);
        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: e.message
        };
    }
};

// Flash Sale - book_type = 'Flash Sale', sorted by biggest discount first
const getFlashSaleService = async ({ limit = 12 } = {}) => {
    try {
        const books = await CharacterBook.findAll({
            where: { book_type: 'Flash Sale' },
            order: [
                [sequelize.literal('(original_price - discounted_price)'), 'DESC'],
                ['created_at', 'DESC']
            ],
            limit: parseInt(limit)
        });

        // Add computed discount_percent to each book
        const booksWithDiscount = books.map(book => {
            const formatted = formatBookResponse(book);
            const original = parseFloat(book.original_price) || 0;
            const discounted = parseFloat(book.discounted_price) || 0;
            if (original > 0) {
                formatted.discount_percent = Math.round(((original - discounted) / original) * 100);
            } else {
                formatted.discount_percent = 0;
            }
            return formatted;
        });

        return {
            status: StatusCodes.OK,
            message: "Flash sale books fetched successfully",
            data: booksWithDiscount
        };
    } catch (e) {
        console.error(e);
        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: e.message
        };
    }
};

// Popular Books - review >= 4.0, sorted by review DESC, then updated_at DESC
const getPopularBooksService = async ({ limit = 12 } = {}) => {
    try {
        const books = await CharacterBook.findAll({
            where: {
                review: { [Op.gte]: 4.0 }
            },
            order: [
                ['review', 'DESC'],
                ['updated_at', 'DESC']
            ],
            limit: parseInt(limit)
        });

        return {
            status: StatusCodes.OK,
            message: "Popular books fetched successfully",
            data: formatBooksArray(books)
        };
    } catch (e) {
        console.error(e);
        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: e.message
        };
    }
};

// Get all books (for browsing)
const getAllBooksService = async ({ limit = 20, page = 1 } = {}) => {
    try {
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { count, rows } = await CharacterBook.findAndCountAll({
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        return {
            status: StatusCodes.OK,
            message: "Books fetched successfully",
            data: {
                books: formatBooksArray(rows),
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

// Delete a character and all associated data
const deleteCharacterService = async (character_id) => {
    const transaction = await sequelize.transaction();
    try {
        const character = await ComicCharacter.findOne({
            where: { character_id },
            transaction
        });

        if (!character) {
            await transaction.rollback();
            return {
                status: StatusCodes.NOT_FOUND,
                message: "Character not found"
            };
        }

        // Delete associated CharacterBooks
        const books = await CharacterBook.findAll({
            where: { character_id },
            transaction
        });

        if (books.length > 0) {
            await CharacterBook.destroy({
                where: { character_id },
                transaction
            });
            console.log(`Deleted ${books.length} character books`);
        }

        // Delete character-roles junction entries (if not using CASCADE)
        await sequelize.query(
            `DELETE FROM "character-roles" WHERE character_id = :character_id`,
            {
                replacements: { character_id },
                transaction
            }
        );

        // Delete the character
        await character.destroy({ transaction });

        await transaction.commit();
        return {
            status: StatusCodes.OK,
            message: "Character deleted successfully"
        };
    } catch (e) {
        await transaction.rollback();
        console.error(e);
        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: e.message
        };
    }
};

module.exports = {
    getAllCharactersService,
    getCharacterByIdService,
    createCharacterService,
    updateCharacterService,
    addBookToCharacterService,
    addBooksToCharacterService,
    removeBookFromCharacterService,
    updateBookService,
    getBookByIdService,
    deleteCharacterService,
    // Feed services
    getLatestReleasesService,
    getFlashSaleService,
    getPopularBooksService,
    getAllBooksService,
    // Utilities
    normalizeBookData,
    formatBookResponse,
    BOOK_TYPES
};