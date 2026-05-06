'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('character_books', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      character_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'comic_characters', key: 'character_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      comic_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'comic', key: 'comic_id' },
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL'
      },
      title: { type: DataTypes.STRING, allowNull: false },
      author: { type: DataTypes.STRING, allowNull: true },
      category: { type: DataTypes.STRING, allowNull: true },
      original_price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      discounted_price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      stock: { type: DataTypes.INTEGER, defaultValue: 0 },
      tags: { type: DataTypes.STRING, allowNull: true },
      image: { type: DataTypes.STRING, allowNull: true },
      book_type: {
        type: DataTypes.ENUM('E-book', 'Physical', 'Sale', 'Flash Sale', 'New Item'),
        allowNull: true
      },
      pdf_file: { type: DataTypes.STRING, allowNull: true },
      review: { type: DataTypes.INTEGER, defaultValue: 0 },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    });

    await queryInterface.addIndex('character_books', ['character_id']);
    await queryInterface.addIndex('character_books', ['comic_id']);
    await queryInterface.addIndex('character_books', ['category']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('character_books');
  }
};