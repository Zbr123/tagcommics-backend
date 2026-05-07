const { StatusCodes } = require("http-status-codes");
const { sequelize } = require("../../config/pg-config");
const { Op } = require("sequelize");
const Order = require("../models/order");
const Payment = require("../models/payment");
const User = require("../models/user");

// Map DB status to frontend status
const mapOrderStatus = (status) => {
  const mapping = {
    'placed': 'Pending',
    'processing': 'Processing',
    'shipped': 'Shipped',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled'
  };
  return mapping[status] || status;
};

const mapPaymentStatus = (status) => {
  const mapping = {
    'paid': 'Paid',
    'pending': 'Pending',
    'failed': 'Failed',
    'unpaid': 'Pending'
  };
  return mapping[status] || status;
};

const mapPaymentMethod = (mode) => {
  const mapping = {
    'cash-on-delivery': 'Cash on Delivery',
    'online-transfer': 'Online Transfer'
  };
  return mapping[mode] || mode;
};

// Generate order number
const generateOrderNumber = (orderId) => {
  const year = new Date().getFullYear();
  const shortId = orderId.substring(0, 8).toUpperCase();
  return `ORD-${year}-${shortId}`;
};

// Generate tracking number
const generateTrackingNumber = () => {
  return `TRK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
};

// Format order for frontend
const formatOrderForFrontend = (order, payment) => {
  const orderData = order.toJSON ? order.toJSON() : order;
  const paymentData = payment ? (payment.toJSON ? payment.toJSON() : payment) : null;

  // Calculate totals from comics if not stored
  let subtotal = orderData.subtotal;
  let shipping = orderData.shipping || 5;
  let tax = orderData.tax || 0;
  let total = orderData.total_amount;

  if (!subtotal && orderData.comics && Array.isArray(orderData.comics)) {
    subtotal = orderData.comics.reduce((sum, item) => {
      const price = parseFloat(item.unit_price) || 0;
      return sum + (price * (item.quantity || 1));
    }, 0);
    tax = parseFloat((subtotal * 0.1).toFixed(2));
    total = parseFloat((subtotal + shipping + tax).toFixed(2));
  }

  // Format items
  const items = (orderData.comics || []).map((item, idx) => ({
    id: idx + 1,
    title: item.title || 'Unknown',
    author: item.author || '',
    price: parseFloat(item.unit_price) || 0,
    quantity: item.quantity || 1,
    image: item.image ? `/api/v1/uploads/comics/images/${item.image}` : null
  }));

  return {
    id: orderData.order_id,
    orderNumber: generateOrderNumber(orderData.order_id),
    customerName: orderData.customer ? orderData.customer.name : 'Unknown',
    customerEmail: orderData.customer ? orderData.customer.email : 'Unknown',
    customerPhone: orderData.customer ? orderData.customer.phone : null,
    orderDate: orderData.created_at,
    status: mapOrderStatus(orderData.order_status),
    paymentMethod: paymentData ? mapPaymentMethod(paymentData.payment_mode) : 'Cash on Delivery',
    paymentStatus: paymentData ? mapPaymentStatus(paymentData.payment_status) : 'Pending',
    items,
    subtotal: parseFloat(subtotal) || 0,
    shipping: parseFloat(shipping) || 0,
    tax: parseFloat(tax) || 0,
    total: parseFloat(total) || 0,
    shippingAddress: orderData.shipping_address || null,
    trackingNumber: orderData.tracking_number || null,
    estimatedDelivery: orderData.estimated_delivery || null,
    deliveredDate: orderData.delivered_date || null,
    notes: orderData.notes || '',
    updatedAt: orderData.updated_at,
    createdAt: orderData.created_at
  };
};

// Get all orders with filters
const getOrders = async ({ page = 1, limit = 20, search, status, paymentStatus, startDate, endDate }) => {
  try {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    const userWhere = {};

    // Status filter
    if (status) {
      const statusMap = {
        'Pending': 'placed',
        'Processing': 'processing',
        'Shipped': 'shipped',
        'Delivered': 'delivered',
        'Cancelled': 'cancelled'
      };
      where.order_status = statusMap[status] || status.toLowerCase();
    }

    // Date range
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at[Op.gte] = new Date(startDate);
      if (endDate) where.created_at[Op.lte] = new Date(endDate);
    }

    // Search
    if (search) {
      userWhere[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Payment status filter (needs join)
    let paymentWhere = {};
    if (paymentStatus) {
      const payStatusMap = {
        'Pending': ['pending', 'unpaid'],
        'Paid': 'paid',
        'Failed': 'failed'
      };
      const mapped = payStatusMap[paymentStatus];
      if (Array.isArray(mapped)) {
        paymentWhere.payment_status = { [Op.in]: mapped };
      } else {
        paymentWhere.payment_status = mapped;
      }
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: User, as: 'customer', where: search ? userWhere : undefined, attributes: ['user_id', 'name', 'email', 'phone'] },
        { model: Payment, as: 'payment', where: paymentStatus ? paymentWhere : undefined }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    // Get payments for all orders if not filtered
    const ordersWithPayments = await Promise.all(rows.map(async (order) => {
      let payment = null;
      if (!paymentStatus) {
        payment = await Payment.findOne({ where: { order_id: order.order_id } });
      } else {
        payment = order.payment;
      }
      return formatOrderForFrontend(order, payment);
    }));

    return {
      status: StatusCodes.OK,
      message: "Orders fetched successfully",
      data: {
        orders: ordersWithPayments,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    };
  } catch (e) {
    console.error("getOrders error:", e);
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: e.message
    };
  }
};

// Get single order by ID
const getOrderById = async (orderId) => {
  try {
    const order = await Order.findOne({
      where: { order_id: orderId },
      include: [
        { model: User, as: 'customer', attributes: ['user_id', 'name', 'email', 'phone'] },
        { model: Payment, as: 'payment' }
      ]
    });

    if (!order) {
      return { status: StatusCodes.NOT_FOUND, message: "Order not found" };
    }

    const payment = await Payment.findOne({ where: { order_id: orderId } });
    return {
      status: StatusCodes.OK,
      message: "Order fetched successfully",
      data: formatOrderForFrontend(order, payment)
    };
  } catch (e) {
    console.error("getOrderById error:", e);
    return { status: StatusCodes.INTERNAL_SERVER_ERROR, message: e.message };
  }
};

// Update order status
const updateOrderStatus = async (orderId, newStatus) => {
  const transaction = await sequelize.transaction();

  try {
    const order = await Order.findOne({
      where: { order_id: orderId },
      include: [{ model: Payment, as: 'payment' }],
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return { status: StatusCodes.NOT_FOUND, message: "Order not found" };
    }

    // Valid statuses
    const validStatuses = ['placed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      await transaction.rollback();
      return { status: StatusCodes.BAD_REQUEST, message: "Invalid status" };
    }

    // Auto-generate tracking if shipped without tracking
    let trackingNumber = order.tracking_number;
    if (newStatus === 'shipped' && !trackingNumber) {
      trackingNumber = generateTrackingNumber();
    }

    // If delivered and COD, set payment to paid
    let paymentUpdate = {};
    if (newStatus === 'delivered' && order.payment && order.payment.payment_mode === 'cash-on-delivery') {
      paymentUpdate = { payment_status: 'paid' };
    }

    // Set delivered date if delivered
    let deliveredDate = order.delivered_date;
    if (newStatus === 'delivered' && !deliveredDate) {
      deliveredDate = new Date();
    }

    await order.update({
      order_status: newStatus,
      tracking_number: trackingNumber,
      delivered_date: deliveredDate,
      updated_at: new Date()
    }, { transaction });

    if (Object.keys(paymentUpdate).length > 0) {
      await order.payment.update(paymentUpdate, { transaction });
    }

    await transaction.commit();

    return getOrderById(orderId);
  } catch (e) {
    await transaction.rollback();
    console.error("updateOrderStatus error:", e);
    return { status: StatusCodes.INTERNAL_SERVER_ERROR, message: e.message };
  }
};

// Update payment status
const updatePaymentStatus = async (orderId, paymentStatus) => {
  const transaction = await sequelize.transaction();

  try {
    const order = await Order.findOne({
      where: { order_id: orderId },
      include: [{ model: Payment, as: 'payment' }],
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return { status: StatusCodes.NOT_FOUND, message: "Order not found" };
    }

    const validStatuses = ['pending', 'paid', 'failed'];
    if (!validStatuses.includes(paymentStatus)) {
      await transaction.rollback();
      return { status: StatusCodes.BAD_REQUEST, message: "Invalid payment status" };
    }

    if (order.payment) {
      await order.payment.update({
        payment_status: paymentStatus,
        payment_received: paymentStatus === 'paid' ? order.total_amount : 0
      }, { transaction });
    }

    await order.update({ updated_at: new Date() }, { transaction });

    await transaction.commit();

    return getOrderById(orderId);
  } catch (e) {
    await transaction.rollback();
    console.error("updatePaymentStatus error:", e);
    return { status: StatusCodes.INTERNAL_SERVER_ERROR, message: e.message };
  }
};

// Update tracking number
const updateTrackingNumber = async (orderId, trackingNumber) => {
  const transaction = await sequelize.transaction();

  try {
    const order = await Order.findOne({ where: { order_id: orderId }, transaction });

    if (!order) {
      await transaction.rollback();
      return { status: StatusCodes.NOT_FOUND, message: "Order not found" };
    }

    await order.update({
      tracking_number: trackingNumber,
      updated_at: new Date()
    }, { transaction });

    await transaction.commit();

    return getOrderById(orderId);
  } catch (e) {
    await transaction.rollback();
    console.error("updateTrackingNumber error:", e);
    return { status: StatusCodes.INTERNAL_SERVER_ERROR, message: e.message };
  }
};

// Update order notes
const updateOrderNotes = async (orderId, notes) => {
  const transaction = await sequelize.transaction();

  try {
    const order = await Order.findOne({ where: { order_id: orderId }, transaction });

    if (!order) {
      await transaction.rollback();
      return { status: StatusCodes.NOT_FOUND, message: "Order not found" };
    }

    await order.update({
      notes,
      updated_at: new Date()
    }, { transaction });

    await transaction.commit();

    return getOrderById(orderId);
  } catch (e) {
    await transaction.rollback();
    console.error("updateOrderNotes error:", e);
    return { status: StatusCodes.INTERNAL_SERVER_ERROR, message: e.message };
  }
};

module.exports = {
  getOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  updateTrackingNumber,
  updateOrderNotes,
  formatOrderForFrontend
};