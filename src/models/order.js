const { DataTypes } = require('sequelize')
const { sequelize } = require('../../config/pg-config');

const Order = sequelize.define('order', {
    order_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    customer_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    total_amount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    order_status: {
        type: DataTypes.ENUM('placed', 'delivered', 'shipped', 'processing', 'cancelled'),
        defaultValue: 'placed'
    },
    comics: {
        type: DataTypes.JSONB,
        allowNull: false
    },
    tracking_number: {
        type: DataTypes.STRING,
        allowNull: true
    },
    estimated_delivery: {
        type: DataTypes.DATE,
        allowNull: true
    },
    delivered_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    shipping_address: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    subtotal: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    shipping: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    tax: {
        type: DataTypes.FLOAT,
        allowNull: true
    }
}, {
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Associations defined in associations.js
// Order -> User (customer) via customer_id
// Order -> Payment via order_id

module.exports = Order;