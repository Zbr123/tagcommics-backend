'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('cart_items', {
      item_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      cart_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'carts', key: 'cart_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      title_snapshot: { type: DataTypes.TEXT, allowNull: false },
      author_snapshot: { type: DataTypes.TEXT, allowNull: true },
      image_snapshot: { type: DataTypes.TEXT, allowNull: true },
      unit_price_snapshot: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      original_price_snapshot: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 1
        }
      },
      meta: { type: DataTypes.JSONB, allowNull: true },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    });

    await queryInterface.addIndex('cart_items', ['cart_id']);
    await queryInterface.addIndex('cart_items', ['comic_id']);
    await queryInterface.addIndex('cart_items', ['character_book_id']);

    // Constraint: exactly one of comic_id or character_book_id must be set
    await queryInterface.addConstraint('cart_items', {
      fields: ['item_type', 'comic_id', 'character_book_id'],
      type: 'check',
      where: Sequelize.literal(`
        (item_type = 'comic' AND comic_id IS NOT NULL AND character_book_id IS NULL) OR
        (item_type = 'character_book' AND character_book_id IS NOT NULL AND comic_id IS NULL)
      `),
      name: 'cart_items_type_constraint'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('cart_items', 'cart_items_type_constraint');
    await queryInterface.dropTable('cart_items');
  }
};