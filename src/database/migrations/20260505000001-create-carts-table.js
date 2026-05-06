'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('carts', {
      cart_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      customer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'user_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: DataTypes.ENUM('active', 'converted', 'abandoned'),
        defaultValue: 'active'
      },
      currency: {
        type: DataTypes.STRING(10),
        defaultValue: 'USD'
      },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    });

    await queryInterface.addIndex('carts', ['customer_id']);
    await queryInterface.addIndex('carts', ['status']);
    await queryInterface.addIndex('carts', ['customer_id', 'status'], {
      unique: true,
      where: {
        status: 'active'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('carts');
  }
};