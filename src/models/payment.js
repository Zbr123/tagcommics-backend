const { DataTypes } = require('sequelize')
const { sequelize } = require('../../config/pg-config');
const Order = require('./order');

const Payment = sequelize.define('payment', {
    payment_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    payment_status: {
        type: DataTypes.ENUM('paid', 'unpaid')
    },
    payment_received: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    payment_mode: {
        type: DataTypes.ENUM('cash-on-delivery', 'online-transfer'),
        defaultValue: 'cash-on-delivery'
    },
    order_id: {
        type: DataTypes.UUID,
        references: {
            model: Order,
            key: 'order_id'
        }
    },
    stripe_customer_id: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Stripe customer id when payment_mode is online-transfer'
    }
})

module.exports = Payment;