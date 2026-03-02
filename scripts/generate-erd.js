/**
 * Generates an ERD from Sequelize models and saves it as SVG.
 * Run: npm run erd  or  node scripts/generate-erd.js
 */
const { writeFileSync } = require("fs");
const path = require("path");
const sequelizeErd = require("sequelize-erd");

const db = require("./erd-source.js");

const OUT_DIR = path.join(__dirname, "..");
const SVG_PATH = path.join(OUT_DIR, "erd.svg");

(async function () {
  try {
    const svg = await sequelizeErd({
      source: db,
      format: "svg",
      engine: "dot",
      arrowSize: 0.1,
      lineWidth: 0.5,
    });
    writeFileSync(SVG_PATH, svg);
    console.log(`ERD saved to ${SVG_PATH}`);
  } catch (err) {
    console.error("Failed to generate ERD:", err);
    process.exit(1);
  }
})();
