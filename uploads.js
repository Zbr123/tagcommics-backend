
const path = require('path');
const fs = require('fs');


const comic_pdf_path = path.resolve(
    process.cwd(),
    "src",
    "uploads",
    "comics",
    "pdf"
);

if (!fs.existsSync(comic_pdf_path)) {
    // Create the directory if it does not exist
    fs.mkdirSync(comic_pdf_path, { recursive: true });
}


module.exports = { comic_pdf_path }