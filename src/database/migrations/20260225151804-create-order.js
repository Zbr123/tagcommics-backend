'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      order_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },

      customer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users', // table name (NOT model)
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      total_amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },

      order_status: {
        type: Sequelize.ENUM(
          'placed',
          'delivered',
          'shipped',
          'processing',
          'cancelled'
        ),
        defaultValue: 'placed',
      },

      comics: {
        type: Sequelize.JSONB,
        allowNull: false,
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
    await queryInterface.dropTable('orders');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_orders_order_status";'
    );
  },
};