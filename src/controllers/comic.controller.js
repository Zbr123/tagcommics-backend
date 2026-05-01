const comicService = require("../services/comic.service");
const path = require('path');
const { saveFile } = require("../utils/save-file");

const createComicController = async (req, res) => {
    const parts = req.parts();

    let fields = {};

    for await (const part of parts) {
        if (part.type === "file") {

            if (part.fieldname === "cover_image") {
                fields.cover_image_url = await saveFile(
                    part,
                    path.join(process.cwd(), "src/uploads/comics/images")
                );
            }

            if (part.fieldname === "digital_file") {
                fields.digital_file_url = await saveFile(
                    part,
                    path.join(process.cwd(), "src/uploads/comics/pdfs")
                );
            }

        } else {
            fields[part.fieldname] = part.value;
        }
    }

    const result = await comicService.createComic({ ...fields });

    res.status(result.status).send(result);
};

const getComicController = async (req, res) => {
    const body = req.body;
    let result = null;
    if (body) {
        result = await comicService.getComics({ ...body });
    } else {
        result = await comicService.getComics();
    }

    res.status(result.status).send(result);
};

const getComicsByCharacterController = async (req, res) => {
    const { character_id } = req.params;
    const result = await comicService.getComicsByCharacter(character_id);
    res.status(result.status).send(result);
};

const deleteComicController = async (req, res) => {
    const { comic_id } = req.body;
    const result = await comicService.deleteComic(comic_id);
    res.status(result.status).send(result);
};


module.exports = {
    createComicController,
    getComicController,
    getComicsByCharacterController,
    deleteComicController
};
