const comicService = require("../services/comic.service");
const path = require('path');
const { saveFile } = require("../utils/save-file");

const createComicController = async (req, res) => {
    let fields = {};

    // Check if request is multipart
    const contentType = req.headers['content-type'] || '';

    if (contentType.includes('multipart/form-data')) {
        // Multipart upload (with file support)
        const parts = req.parts();
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
    } else {
        // JSON body
        fields = req.body || {};
    }

    const result = await comicService.createComic({ ...fields });
    res.status(result.status).send(result);

};

const getComicsController = async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const result = await comicService.getComics({ page, limit });
    res.status(result.status).send(result);
};

const getComicByIdController = async (req, res) => {
    const { id } = req.params;
    const result = await comicService.getComicById(id);
    res.status(result.status).send(result);
};

const getFeaturedComicsController = async (req, res) => {
    const result = await comicService.getFeaturedComics();
    res.status(result.status).send(result);
};

const getNewReleasesController = async (req, res) => {
    const { limit = 10 } = req.query;
    const result = await comicService.getNewReleases({ limit });
    res.status(result.status).send(result);
};

const getBestSellersController = async (req, res) => {
    const { limit = 10 } = req.query;
    const result = await comicService.getBestSellers({ limit });
    res.status(result.status).send(result);
};

const getByCategoryController = async (req, res) => {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const result = await comicService.getByCategory(category, { page, limit });
    res.status(result.status).send(result);
};

const searchComicsController = async (req, res) => {
    const { q, page = 1, limit = 20 } = req.query;
    const result = await comicService.searchComics({ q, page, limit });
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
    getComicsController,
    getComicByIdController,
    getFeaturedComicsController,
    getNewReleasesController,
    getBestSellersController,
    getByCategoryController,
    searchComicsController,
    getComicsByCharacterController,
    deleteComicController
};