'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('comic', {
      comic_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      currency: {
        type: DataTypes.ENUM('USD', 'PKR'),
        defaultValue: 'USD',
        allowNull: false
      },
      author: {
        type: DataTypes.STRING,
        allowNull: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      issue_number: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      series_name: {
        type: DataTypes.STRING,
        allowNull: true
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      discount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      cover_image_url: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      digital_file_url: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      is_digital: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      is_physical: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      stock_quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      published_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      rating: {
        type: DataTypes.FLOAT,
        defaultValue: 0
      },
      sold_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('comic');
  }
};
