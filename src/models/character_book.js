const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/pg-config");

const CharacterBook = sequelize.define("character_book", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  character_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  comic_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  author: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  original_price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  discounted_price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  tags: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  book_type: {
    type: DataTypes.ENUM('E-book', 'Physical', 'Sale', 'Flash Sale', 'New Item'),
    allowNull: true,
  },
  pdf_file: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  review: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = CharacterBook;