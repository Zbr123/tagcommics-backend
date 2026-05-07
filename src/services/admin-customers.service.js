const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");
const User = require("../models/user");
const Order = require("../models/order");
const Payment = require("../models/payment");

// Get all customers with pagination and search
const getCustomers = async ({ page = 1, limit = 20, search }) => {
  try {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    // Search filter
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: ['user_id', 'name', 'email', 'phone', 'created_at', 'updated_at'],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    // Get order stats for each customer
    const customersWithStats = await Promise.all(rows.map(async (user) => {
      const userData = user.toJSON ? user.toJSON() : user;

      // Get total orders count
      const orderCount = await Order.count({ where: { customer_id: user.user_id } });

      // Get total spent (completed orders only) - use raw query to avoid eager loading issues
      const paidOrders = orderCount > 0
        ? await Order.findAll({
            where: { customer_id: user.user_id },
            attributes: ['total_amount']
          })
        : [];

      // Get payments separately
      const paidOrderIds = paidOrders.map(o => o.order_id);
      const paidPayments = paidOrderIds.length > 0
        ? await Payment.findAll({ where: { order_id: paidOrderIds, payment_status: 'paid' } })
        : [];

      const totalSpent = paidPayments.reduce((sum, p) => sum + parseFloat(p.payment_received || 0), 0);

      // Get last order date
      const lastOrder = await Order.findOne({
        where: { customer_id: user.user_id },
        order: [['created_at', 'DESC']],
        attributes: ['created_at']
      });

      return {
        id: userData.user_id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        address: userData.address || null,
        totalOrders: orderCount,
        totalSpent: parseFloat(totalSpent.toFixed(2)),
        lastOrderDate: lastOrder ? lastOrder.created_at : null,
        joinedDate: userData.created_at,
        updatedAt: userData.updated_at
      };
    }));

    return {
      status: StatusCodes.OK,
      message: "Customers fetched successfully",
      data: {
        customers: customersWithStats,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    };
  } catch (e) {
    console.error("getCustomers error:", e);
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: e.message
    };
  }
};

// Get single customer by ID with order history
const getCustomerById = async (customerId) => {
  try {
    const user = await User.findOne({
      where: { user_id: customerId },
      attributes: ['user_id', 'name', 'email', 'phone', 'address', 'created_at', 'updated_at']
    });

    if (!user) {
      return { status: StatusCodes.NOT_FOUND, message: "Customer not found" };
    }

    const userData = user.toJSON ? user.toJSON() : user;

    // Get all orders for this customer
    const orders = await Order.findAll({
      where: { customer_id: customerId },
      order: [['created_at', 'DESC']]
    });

    // Get payments separately to avoid eager loading issues
    const orderIds = orders.map(o => o.order_id);
    const payments = orderIds.length > 0
      ? await Payment.findAll({ where: { order_id: orderIds } })
      : [];
    const paymentMap = payments.reduce((acc, p) => {
      acc[p.order_id] = p;
      return acc;
    }, {});

    // Calculate stats
    const totalOrders = orders.length;
    const totalSpent = paidPayments
      .filter(p => p.payment_status === 'paid')
      .reduce((sum, p) => sum + parseFloat(p.payment_received || 0), 0);

    // Get paid payments for total spent calculation
    const allPayments = orderIds.length > 0
      ? await Payment.findAll({ where: { order_id: orderIds } })
      : [];
    const paidPaymentsList = allPayments.filter(p => p.payment_status === 'paid');
    const totalSpentCalc = paidPaymentsList.reduce((sum, p) => sum + parseFloat(p.payment_received || 0), 0);

    const orderHistory = orders.map(order => ({
      id: order.order_id,
      orderNumber: `ORD-${new Date(order.created_at).getFullYear()}-${order.order_id.substring(0, 8).toUpperCase()}`,
      total: parseFloat(order.total_amount || 0),
      status: order.order_status,
      paymentStatus: paymentMap[order.order_id] ? paymentMap[order.order_id].payment_status : 'unknown',
      date: order.created_at
    }));

    return {
      status: StatusCodes.OK,
      message: "Customer fetched successfully",
      data: {
        id: userData.user_id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        address: userData.address || null,
        totalOrders,
        totalSpent: parseFloat(totalSpentCalc.toFixed(2)),
        joinedDate: userData.created_at,
        updatedAt: userData.updated_at,
        orderHistory
      }
    };
  } catch (e) {
    console.error("getCustomerById error:", e);
    return { status: StatusCodes.INTERNAL_SERVER_ERROR, message: e.message };
  }
};

module.exports = {
  getCustomers,
  getCustomerById
};