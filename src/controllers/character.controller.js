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
    console.error("controllers->character.controller.js->getAllCharactersController");
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal Server Error" });
  }
};

const getCharacterByIdController = async (req, res) => {
  try {
    const result = await characterService.getCharacterByIdService(req.params.character_id);
    res.status(result.status).send({ message: result.message, data: result.data });
  } catch (error) {
    console.error("controllers->character.controller.js->getCharacterByIdController");
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal Server Error" });
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
        if (part.fieldname === 'lore_items' || part.fieldname === 'featured_comics' || part.fieldname === 'related_entities') {
          try {
            fields[part.fieldname] = JSON.parse(part.value);
          } catch (e) {
            fields[part.fieldname] = part.value;
          }
        } else {
          fields[part.fieldname] = part.value;
        }
      }
    }

    const result = await characterService.createCharacterService(fields);
    res.status(result.status).send({ message: result.message, data: result.data });
  } catch (error) {
    console.error("controllers->character.controller.js->createCharacterController");
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal Server Error" });
  }
};

const updateCharacterController = async (req, res) => {
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
        if (part.fieldname === 'lore_items' || part.fieldname === 'featured_comics' || part.fieldname === 'related_entities') {
          try {
            fields[part.fieldname] = JSON.parse(part.value);
          } catch (e) {
            fields[part.fieldname] = part.value;
          }
        } else {
          fields[part.fieldname] = part.value;
        }
      }
    }

    const result = await characterService.updateCharacterService(req.params.character_id, fields);
    res.status(result.status).send({ message: result.message, data: result.data });
  } catch (error) {
    console.error("controllers->character.controller.js->updateCharacterController");
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal Server Error" });
  }
};

// Add book(s) to character - supports multipart/form-data with image and PDF
const addBookToCharacterController = async (req, res) => {
  try {
    const parts = req.parts();
    let bookData = {};

    for await (const part of parts) {
      if (part.type === "file") {
        if (part.fieldname === "image") {
          bookData.image = await saveFile(
            part,
            path.join(process.cwd(), "src/uploads/comics/images"),
          );
        } else if (part.fieldname === "pdf_file") {
          bookData.pdf_file = await saveFile(
            part,
            path.join(process.cwd(), "src/uploads/comics/pdfs"),
          );
        }
      } else {
        if (part.fieldname === 'book' || part.fieldname === 'books') {
          try {
            bookData = JSON.parse(part.value);
          } catch (e) {
            try {
              bookData = JSON.parse(part.value);
            } catch (e2) {
              bookData[part.fieldname] = part.value;
            }
          }
        } else {
          bookData[part.fieldname] = part.value;
        }
      }
    }

    const { character_id } = req.params;
    const result = await characterService.addBookToCharacterService(character_id, bookData);
    res.status(result.status).send({ message: result.message, data: result.data });
  } catch (error) {
    console.error("controllers->character.controller.js->addBookToCharacterController");
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal Server Error" });
  }
};

// Remove book from character
const removeBookFromCharacterController = async (req, res) => {
  try {
    const { character_id } = req.params;
    const { book_id } = req.body;

    const result = await characterService.removeBookFromCharacterService(character_id, book_id);
    res.status(result.status).send({ message: result.message, data: result.data });
  } catch (error) {
    console.error("controllers->character.controller.js->removeBookFromCharacterController");
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal Server Error" });
  }
};

// Update book
const updateBookController = async (req, res) => {
  try {
    const { character_id, book_id } = req.params;
    const parts = req.parts();
    let bookData = {};

    for await (const part of parts) {
      if (part.type === "file") {
        if (part.fieldname === "image") {
          bookData.image = await saveFile(
            part,
            path.join(process.cwd(), "src/uploads/comics/images"),
          );
        } else if (part.fieldname === "pdf_file") {
          bookData.pdf_file = await saveFile(
            part,
            path.join(process.cwd(), "src/uploads/comics/pdfs"),
          );
        }
      } else {
        if (part.fieldname === 'book') {
          try {
            bookData = JSON.parse(part.value);
          } catch (e) {
            bookData[part.fieldname] = part.value;
          }
        } else {
          bookData[part.fieldname] = part.value;
        }
      }
    }

    const result = await characterService.updateBookService(character_id, book_id, bookData);
    res.status(result.status).send({ message: result.message, data: result.data });
  } catch (error) {
    console.error("controllers->character.controller.js->updateBookController");
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal Server Error" });
  }
};

// Get single book
const getBookByIdController = async (req, res) => {
  try {
    const { character_id, book_id } = req.params;
    const result = await characterService.getBookByIdService(character_id, book_id);
    res.status(result.status).send({ message: result.message, data: result.data });
  } catch (error) {
    console.error("controllers->character.controller.js->getBookByIdController");
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal Server Error" });
  }
};

// Delete character
const deleteCharacterController = async (req, res) => {
  try {
    const result = await characterService.deleteCharacterService(req.params.character_id);
    res.status(result.status).send({ message: result.message });
  } catch (error) {
    console.error("controllers->character.controller.js->deleteCharacterController");
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "Internal Server Error" });
  }
};

module.exports = {
  getAllCharactersController,
  getCharacterByIdController,
  createCharacterController,
  updateCharacterController,
  addBookToCharacterController,
  removeBookFromCharacterController,
  updateBookController,
  getBookByIdController,
  deleteCharacterController,
};