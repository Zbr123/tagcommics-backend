/**
 * Exports Sequelize instance with all models and associations loaded.
 * Used by sequelize-erd (CLI or API) to generate the ERD.
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const { sequelize } = require("../config/pg-config");

// Load all models (associations loads Comics, Category, Tag, User)
require("../src/models/associations");
// Order and Payment are not in associations; load them so they appear on the ERD
require("../src/models/order");
require("../src/models/payment");

module.exports = sequelize;
