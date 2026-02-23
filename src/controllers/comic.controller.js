const comicService = require("../services/comic.service");

const createComicController = async (req, res) => {    
    const result = await comicService.createComic({...req.body, user_id: userId});
    res.status(result.status).send({ ...result });
};

module.exports = {
    createComicController
};
