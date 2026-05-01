'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      payment_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },

      payment_status: {
        type: Sequelize.ENUM('paid', 'unpaid'),
        defaultValue: 'unpaid',
      },

      payment_received: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },

      payment_mode: {
        type: Sequelize.ENUM('cash-on-delivery', 'online-transfer'),
        defaultValue: 'cash-on-delivery',
      },

      order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'order_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payments');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_payments_payment_status";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_payments_payment_mode";'
    );
  },
};