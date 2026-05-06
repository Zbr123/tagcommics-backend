const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/pg-config");
const User = require("./user");
const CartItem = require("./cart_item");

const Cart = sequelize.define("cart", {
  cart_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  customer_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'converted', 'abandoned'),
    defaultValue: 'active'
  },
  currency: {
    type: DataTypes.STRING(10),
    defaultValue: 'USD'
  }
}, {
  tableName: 'carts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Cart belongs to User
Cart.belongsTo(User, {
  foreignKey: 'customer_id',
  as: 'customer'
});
User.hasMany(Cart, {
  foreignKey: 'customer_id',
  as: 'carts'
});

// Cart has many CartItems
Cart.hasMany(CartItem, {
  foreignKey: 'cart_id',
  as: 'items',
  onDelete: 'CASCADE'
});
CartItem.belongsTo(Cart, {
  foreignKey: 'cart_id'
});

module.exports = Cart;