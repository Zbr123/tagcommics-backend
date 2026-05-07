'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('design_team_inquiries', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      first_name: { type: DataTypes.STRING, allowNull: false },
      last_name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false },
      phone: { type: DataTypes.STRING, allowNull: true },
      company_name: { type: DataTypes.STRING, allowNull: true },
      message: { type: DataTypes.TEXT, allowNull: false },
      source: { type: DataTypes.STRING, allowNull: true },
      submitted_at: { type: DataTypes.DATE, allowNull: true },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    });

    await queryInterface.addIndex('design_team_inquiries', ['email']);
    await queryInterface.addIndex('design_team_inquiries', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('design_team_inquiries');
  }
};