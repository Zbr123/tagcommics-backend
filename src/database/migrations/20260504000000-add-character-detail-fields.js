'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = 'comic_characters';
    const tableDefinition = await queryInterface.describeTable(tableName);

    const addColumnIfMissing = async (columnName, definition) => {
      if (!tableDefinition[columnName]) {
        await queryInterface.addColumn(tableName, columnName, definition);
      }
    };

    await addColumnIfMissing('strength', {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0, max: 100 }
    });

    await addColumnIfMissing('speed', {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0, max: 100 }
    });

    await addColumnIfMissing('intelligence', {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0, max: 100 }
    });

    await addColumnIfMissing('durability', {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0, max: 100 }
    });

    await addColumnIfMissing('lore_items', {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    });

    await addColumnIfMissing('featured_comics', {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    });

    await addColumnIfMissing('related_entities', {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    });

    await addColumnIfMissing('universe', {
      type: DataTypes.STRING,
      allowNull: true
    });

    await addColumnIfMissing('role', {
      type: DataTypes.ENUM('HERO', 'VILLAIN', 'ANTI_HERO', 'ENTITY'),
      allowNull: true
    });

    await addColumnIfMissing('spotlight_body', {
      type: DataTypes.TEXT,
      allowNull: true
    });

    await addColumnIfMissing('title_line1', {
      type: DataTypes.STRING,
      allowNull: true
    });

    await addColumnIfMissing('title_line2', {
      type: DataTypes.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    const tableName = 'comic_characters';
    const tableDefinition = await queryInterface.describeTable(tableName);

    const removeColumnIfExists = async (columnName) => {
      if (tableDefinition[columnName]) {
        await queryInterface.removeColumn(tableName, columnName);
      }
    };

    await removeColumnIfExists('strength');
    await removeColumnIfExists('speed');
    await removeColumnIfExists('intelligence');
    await removeColumnIfExists('durability');
    await removeColumnIfExists('lore_items');
    await removeColumnIfExists('featured_comics');
    await removeColumnIfExists('related_entities');
    await removeColumnIfExists('universe');
    await removeColumnIfExists('role');
    await removeColumnIfExists('spotlight_body');
    await removeColumnIfExists('title_line1');
    await removeColumnIfExists('title_line2');
  }
};