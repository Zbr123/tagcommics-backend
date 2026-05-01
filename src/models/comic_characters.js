const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/pg-config");
const User = require("./user");

const ComicCharacter = sequelize.define("comic_character", {
  character_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  character_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  total_books_appeared_in: {
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
  cover_image_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tags:{
    type: DataTypes.JSONB, // ["tag1", "tag2", ...]
    allowNull: true
  },
  first_appearance: {
    type: DataTypes.STRING,
    allowNull: true
  },
  creator: {
    type: DataTypes.STRING,
    allowNull: true
  },
  alignment: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = ComicCharacter;
