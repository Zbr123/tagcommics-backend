const { StatusCodes } = require("http-status-codes");
const characterService = require("../services/character.service");

const getAllCharactersController = async (req, res) => {
    try {
        const result = await characterService.getAllCharactersService();
        res.status(result.status).send({
            message: result.message,
            data: result.data
        });
    }
    catch (error) {
        console.error("controllers->character.controller.js->getAllCharactersController");
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({message: "Internal Server Error"});
    }
}

const getCharacterByIdController = async (req, res) => {
    try {
        const result = await characterService.getCharacterByIdService(req.params.id);
        res.status(result.status).send({
            message: result.message,
            data: result.data
        });
    }
    catch (error) {
        console.error("controllers->character.controller.js->getCharacterByIdController");
        console.log(error);

        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({message: "Internal Server Error"});
    }
}

const createCharacterController = async (req, res) => {
    try {
        const { ...characterData } = req.body;
        const result = await characterService.createCharacterService(characterData);
        res.status(result.status).send({
            message: result.message,
            data: result.data
        });
    }
    catch (error) {
        console.error("controllers->character.controller.js->createCharacterController");
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({message: "Internal Server Error"});
    }
};


module.exports = {
    getAllCharactersController,
    getCharacterByIdController,
    createCharacterController
}