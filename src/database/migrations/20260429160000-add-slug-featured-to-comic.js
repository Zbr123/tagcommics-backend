'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('comic', 'slug', {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    });

    await queryInterface.addColumn('comic', 'is_featured', {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('comic', 'is_featured');
    await queryInterface.removeColumn('comic', 'slug');
  }
};