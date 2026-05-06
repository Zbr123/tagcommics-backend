const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/pg-config");

const Library = sequelize.define("library", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  customer_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  item_type: {
    type: DataTypes.ENUM("comic", "character_book"),
    allowNull: false,
  },
  comic_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  character_book_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  author: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  pdf_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  purchased_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: "libraries",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = Library;