'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new fields to orders table
    await queryInterface.addColumn('orders', 'tracking_number', {
      type: DataTypes.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('orders', 'estimated_delivery', {
      type: DataTypes.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('orders', 'delivered_date', {
      type: DataTypes.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('orders', 'notes', {
      type: DataTypes.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('orders', 'shipping_address', {
      type: DataTypes.JSONB,
      allowNull: true,
    });

    await queryInterface.addColumn('orders', 'subtotal', {
      type: DataTypes.FLOAT,
      allowNull: true,
    });

    await queryInterface.addColumn('orders', 'shipping', {
      type: DataTypes.FLOAT,
      allowNull: true,
    });

    await queryInterface.addColumn('orders', 'tax', {
      type: DataTypes.FLOAT,
      allowNull: true,
    });

    // Update payment_status enum to include pending and failed
    await queryInterface.sequelize.query("ALTER TYPE enum_payments_payment_status ADD VALUE 'pending'");
    await queryInterface.sequelize.query("ALTER TYPE enum_payments_payment_status ADD VALUE 'failed'");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('orders', 'tax');
    await queryInterface.removeColumn('orders', 'shipping');
    await queryInterface.removeColumn('orders', 'subtotal');
    await queryInterface.removeColumn('orders', 'shipping_address');
    await queryInterface.removeColumn('orders', 'notes');
    await queryInterface.removeColumn('orders', 'delivered_date');
    await queryInterface.removeColumn('orders', 'estimated_delivery');
    await queryInterface.removeColumn('orders', 'tracking_number');

    // Revert enum - PostgreSQL requires recreation
    await queryInterface.sequelize.query("ALTER TYPE enum_payments_payment_status DROP VALUE IF EXISTS 'failed'");
    await queryInterface.sequelize.query("ALTER TYPE enum_payments_payment_status DROP VALUE IF EXISTS 'pending'");
  }
};