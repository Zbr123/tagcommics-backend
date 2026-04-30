const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

async function saveFile(file, folderPath) {
    // Ensure folder exists
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    const ext = path.extname(file.filename);
    const fileName = uuidv4() + ext;
    const filePath = path.join(folderPath, fileName);

    // ✅ Convert stream to buffer (VERY IMPORTANT)
    const buffer = await file.toBuffer();
    fs.writeFileSync(filePath, buffer);
    
    console.log(fileName)
    return fileName;
}

module.exports = { saveFile };