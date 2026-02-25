const { StatusCodes } = require("http-status-codes");
const { Comics } = require("../models/comics");
const { deleteFile } = require("../utils/delete-file");
const path = require('path')

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
      discount: fields.discount ?? 0,
      cover_image_url: fields.cover_image_url,
      digital_file_url: fields.digital_file_url,
      is_digital: fields.is_digital ?? false,
      is_physical: fields.is_physical ?? true,
      stock_quantity: fields.stock_quantity ?? 0,
      published_date: fields.published_date,
      rating: fields.rating ?? 0,
      sold_count: fields.sold_count ?? 0
    });

    return {
      status: StatusCodes.CREATED,
      message: "Comic created successfully",
      data: comic
    };

  } catch (e) {
    console.error(e);
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: e.message
    };
  }
};

const getComics = async () => {
  try {
    const comic = await Comics.findAll();

    if (comic.length == 0) {

      return {
        status: StatusCodes.NOT_FOUND,
        message: "Comics not found"
      }
    }

    return {
      status: StatusCodes.OK,
      message: "Comic fetched successfully",
      data: comic
    };

  } catch (e) {
    console.error(e);
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: e.message
    };
  }
};

const deleteComic = async (comic_id) => {
  try {
    const comic = await Comics.findByPk(comic_id);

    if (!comic) {
      return {
        status: StatusCodes.NOT_FOUND,
        message: "Comics not found"
      }
    }
    console.log(path.join(process.cwd(), `src/uploads/comics/images/${comic?.cover_image_url}`))
    const comic_image_path = path.join(process.cwd(), `src/uploads/comics/images/${comic?.cover_image_url}`);
    const comic_pdf_path = path.join(process.cwd(), `src/uploads/comics/pdfs/${comic?.digital_file_url}`);

    deleteFile(comic_pdf_path);
    deleteFile(comic_image_path);

    await comic.destroy();

    return {
      status: StatusCodes.OK,
      message: "Comic deleted successfully",
    };

  } catch (e) {
    console.error(e);
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: e.message
    };

  }
}

module.exports = { createComic, getComics, deleteComic };
