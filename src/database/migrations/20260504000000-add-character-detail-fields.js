'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('comic_characters', 'strength', {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0, max: 100 }
    });

    await queryInterface.addColumn('comic_characters', 'speed', {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0, max: 100 }
    });

    await queryInterface.addColumn('comic_characters', 'intelligence', {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0, max: 100 }
    });

    await queryInterface.addColumn('comic_characters', 'durability', {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0, max: 100 }
    });

    await queryInterface.addColumn('comic_characters', 'lore_items', {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    });

    await queryInterface.addColumn('comic_characters', 'featured_comics', {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    });

    await queryInterface.addColumn('comic_characters', 'related_entities', {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    });

    await queryInterface.addColumn('comic_characters', 'universe', {
      type: DataTypes.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('comic_characters', 'role', {
      type: DataTypes.ENUM('HERO', 'VILLAIN', 'ANTI_HERO', 'ENTITY'),
      allowNull: true
    });

    await queryInterface.addColumn('comic_characters', 'spotlight_body', {
      type: DataTypes.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('comic_characters', 'title_line1', {
      type: DataTypes.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('comic_characters', 'title_line2', {
      type: DataTypes.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('comic_characters', 'strength');
    await queryInterface.removeColumn('comic_characters', 'speed');
    await queryInterface.removeColumn('comic_characters', 'intelligence');
    await queryInterface.removeColumn('comic_characters', 'durability');
    await queryInterface.removeColumn('comic_characters', 'lore_items');
    await queryInterface.removeColumn('comic_characters', 'featured_comics');
    await queryInterface.removeColumn('comic_characters', 'related_entities');
    await queryInterface.removeColumn('comic_characters', 'universe');
    await queryInterface.removeColumn('comic_characters', 'role');
    await queryInterface.removeColumn('comic_characters', 'spotlight_body');
    await queryInterface.removeColumn('comic_characters', 'title_line1');
    await queryInterface.removeColumn('comic_characters', 'title_line2');
  }
};