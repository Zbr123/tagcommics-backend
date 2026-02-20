'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('comic-categories', {
      comic_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: { model: 'comic', key: 'comic_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      category_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: { model: 'category', key: 'category_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    });

    await queryInterface.createTable('comic-tags', {
      comic_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: { model: 'comic', key: 'comic_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tag_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: { model: 'tag', key: 'tag_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('comic-tags');
    await queryInterface.dropTable('comic-categories');
  }
};
