'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('comic_characters', {
      character_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      character_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      total_books_appeared_in: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      cover_image_url: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      tags: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      first_appearance: {
        type: DataTypes.STRING,
        allowNull: true
      },
      creator: {
        type: DataTypes.STRING,
        allowNull: true
      },
      alignment: {
        type: DataTypes.STRING,
        allowNull: true
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('comic_characters', { cascade: true });
  }
};