const { StatusCodes } = require("http-status-codes");
const ComicCharacter = require("../models/comic_characters");
const CharacterBook = require("../models/character_book");
const { Comics } = require("../models/comics");

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

        return {
            status: StatusCodes.OK,
            message: "Characters fetched successfully",
            data: characters
        };

    } catch (e) {
        console.error(e);
        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: e.message
        };
    }
};

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

        return {
            status: StatusCodes.OK,
            message: "Character fetched successfully",
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

        const newBook = await CharacterBook.create({
            character_id,
            comic_id: bookData.comic_id || null,
            title: bookData.title,
            author: bookData.author || null,
            category: bookData.category || null,
            original_price: bookData.original_price ?? 0,
            discounted_price: bookData.discounted_price ?? 0,
            stock: bookData.stock ?? 0,
            tags: bookData.tags || null,
            image: bookData.image || null,
            book_type: bookData.book_type || null,
            pdf_file: bookData.pdf_file || null,
            review: bookData.review ?? 0
        });

        const updatedCharacter = await ComicCharacter.findOne({
            where: { character_id },
            include: [{ model: CharacterBook, as: 'books' }]
        });

        return {
            status: StatusCodes.CREATED,
            message: "Book added to character successfully",
            data: updatedCharacter
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
            booksArray.map(book => CharacterBook.create({
                character_id,
                comic_id: book.comic_id || null,
                title: book.title,
                author: book.author || null,
                category: book.category || null,
                original_price: book.original_price ?? 0,
                discounted_price: book.discounted_price ?? 0,
                stock: book.stock ?? 0,
                tags: book.tags || null,
                image: book.image || null,
                book_type: book.book_type || null,
                pdf_file: book.pdf_file || null,
                review: book.review ?? 0
            }))
        );

        const updatedCharacter = await ComicCharacter.findOne({
            where: { character_id },
            include: [{ model: CharacterBook, as: 'books' }]
        });

        return {
            status: StatusCodes.CREATED,
            message: "Books added to character successfully",
            data: updatedCharacter
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

        return {
            status: StatusCodes.OK,
            message: "Book removed from character successfully",
            data: updatedCharacter
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

        await book.update(bookData);

        return {
            status: StatusCodes.OK,
            message: "Book updated successfully",
            data: book
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
            data: book
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
    getAllCharactersService,
    getCharacterByIdService,
    createCharacterService,
    updateCharacterService,
    addBookToCharacterService,
    addBooksToCharacterService,
    removeBookFromCharacterService,
    updateBookService,
    getBookByIdService
};