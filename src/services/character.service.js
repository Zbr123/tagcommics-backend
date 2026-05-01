const { StatusCodes } = require("http-status-codes");
const { Comics } = require("../models/comics");
const ComicCharacter = require("../models/comic_characters");
const { Op } = require("sequelize");

const getAllCharactersService = async () => {
    try {
        const characters = await ComicCharacter.findAll();

        if (characters.length === 0) {
            return {
                status: StatusCodes.NOT_FOUND,
                message: "No characters found",
                data: []
            };
        }

        const charactersWithComics = await Promise.all(
            characters.map(async (character) => {
                const comics = await Comics.findAll({
                    where: {
                        characters: {
                            [Op.contains]: [character.character_id]
                        }
                    }
                });

                return {
                    ...character.toJSON(),
                    comics: comics.map(comic => ({
                        comic_id: comic.comic_id,
                        title: comic.title,
                        issue_number: comic.issue_number,
                        series_name: comic.series_name,
                        cover_image_url: comic.cover_image_url
                    }))
                };
            })
        );

        return {
            status: StatusCodes.OK,
            message: "Characters fetched successfully",
            data: charactersWithComics
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
        const character = await ComicCharacter.findOne({ where: { character_id } });
        if (!character) {
            return {
                status: StatusCodes.NOT_FOUND,
                message: "Character not found"
            };
        }
        const comics = await Comics.findAll({
            where: {
                characters: {
                    [Op.contains]: [character.character_id]
                }
            }
        });
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

module.exports = { getAllCharactersService, createCharacterService, getCharacterByIdService };
