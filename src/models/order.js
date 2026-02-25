const { DataTypes } = require('sequelize')
const { sequelize } = require('../../config/pg-config');
const User = require('./user');

const Order = sequelize.define('order', {
    order_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    customer_id: {
        type: DataTypes.UUID,
        references: {
            model: User,
            key: 'user_id'
        }
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
    }
})

module.exports = Order;