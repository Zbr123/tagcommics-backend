const { StatusCodes } = require("http-status-codes");
const characterService = require("../services/character.service");
const path = require("path");
const { saveFile } = require("../utils/save-file");

const getAllCharactersController = async (req, res) => {
  try {
    const result = await characterService.getAllCharactersService();
    res.status(result.status).send({
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error(
      "controllers->character.controller.js->getAllCharactersController",
    );
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: "Internal Server Error" });
  }
};

const getCharacterByIdController = async (req, res) => {
  try {
    const result = await characterService.getCharacterByIdService(
      req.params.character_id,
    );
    res.status(result.status).send({
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error(
      "controllers->character.controller.js->getCharacterByIdController",
    );
    console.log(error);

    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: "Internal Server Error" });
  }
};

const createCharacterController = async (req, res) => {
  try {
    const parts = req.parts();
    let fields = {};

    for await (const part of parts) {
      if (part.type === "file") {
        if (part.fieldname === "cover_image") {
          fields.cover_image_url = await saveFile(
            part,
            path.join(process.cwd(), "src/uploads/characters/images"),
          );
        }
      } else {
        fields[part.fieldname] = part.value;
      }
    }

    const result = await characterService.createCharacterService(fields);
    res.status(result.status).send({
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error(
      "controllers->character.controller.js->createCharacterController",
    );
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: "Internal Server Error" });
  }
};

module.exports = {
  getAllCharactersController,
  getCharacterByIdController,
  createCharacterController,
};
