'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('libraries', {
      id: {
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
      order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'orders', key: 'order_id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      item_type: {
        type: DataTypes.ENUM('comic', 'character_book'),
        allowNull: false
      },
      comic_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'comic', key: 'comic_id' },
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL'
      },
      character_book_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'character_books', key: 'id' },
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL'
      },
      title: { type: DataTypes.TEXT, allowNull: false },
      author: { type: DataTypes.TEXT, allowNull: true },
      image: { type: DataTypes.TEXT, allowNull: true },
      pdf_url: { type: DataTypes.TEXT, allowNull: true },
      purchased_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    });

    await queryInterface.addIndex('libraries', ['customer_id']);
    await queryInterface.addIndex('libraries', ['order_id']);
    await queryInterface.addIndex('libraries', ['comic_id']);
    await queryInterface.addIndex('libraries', ['character_book_id']);
    await queryInterface.addIndex('libraries', ['customer_id', 'item_type', 'comic_id'], {
      unique: true,
      where: {
        comic_id: { [Sequelize.Op.ne]: null }
      }
    });
    await queryInterface.addIndex('libraries', ['customer_id', 'item_type', 'character_book_id'], {
      unique: true,
      where: {
        character_book_id: { [Sequelize.Op.ne]: null }
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('libraries');
  }
};