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

module.exports = {
    createComicController
};
