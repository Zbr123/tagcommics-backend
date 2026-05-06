const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/pg-config");
const { Comics } = require("./comics");
const CharacterBook = require("./character_book");

const CartItem = sequelize.define("cart_item", {
  item_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  cart_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  item_type: {
    type: DataTypes.ENUM('comic', 'character_book'),
    allowNull: false
  },
  comic_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  character_book_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  title_snapshot: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  author_snapshot: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image_snapshot: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  unit_price_snapshot: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  original_price_snapshot: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  meta: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  tableName: 'cart_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// CartItem belongs to Comic (optional)
CartItem.belongsTo(Comics, {
  foreignKey: 'comic_id',
  as: 'comic',
  constraints: false
});

// CartItem belongs to CharacterBook (optional)
CartItem.belongsTo(CharacterBook, {
  foreignKey: 'character_book_id',
  as: 'characterBook',
  constraints: false
});

module.exports = CartItem;