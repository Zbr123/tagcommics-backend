const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/pg-config");

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
  tags: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
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
  },

  // Stat scores (0-100)
  strength: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0, max: 100 }
  },
  speed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0, max: 100 }
  },
  intelligence: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0, max: 100 }
  },
  durability: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0, max: 100 }
  },

  // Lore/Origin Story
  lore_items: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },

  // Featured Comics
  featured_comics: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },

  // Related Entities
  related_entities: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },

  // Hero Spotlight Additional Fields
  universe: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('HERO', 'VILLAIN', 'ANTI_HERO', 'ENTITY'),
    allowNull: true
  },
  spotlight_body: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  title_line1: {
    type: DataTypes.STRING,
    allowNull: true
  },
  title_line2: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = ComicCharacter;