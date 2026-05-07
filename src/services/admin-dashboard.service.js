const { StatusCodes } = require("http-status-codes");
const { sequelize } = require("../../config/pg-config");
const { QueryTypes } = require("sequelize");
const User = require("../models/user");
const Order = require("../models/order");
const CharacterBook = require("../models/character_book");
const Payment = require("../models/payment");

// Get dashboard overview with all aggregate stats
const getDashboardOverview = async () => {
    try {
        const query = `
            SELECT
                -- totalProducts: count of active books
                (SELECT COUNT(*) FROM character_books) AS total_products,
                -- totalOrders: count of all orders (excluding cancelled)
                (SELECT COUNT(*) FROM orders WHERE order_status != 'cancelled') AS total_orders,
                -- totalRevenue: sum of paid order totals where order is placed/delivered/shipped
                (
                    SELECT COALESCE(SUM(p.payment_received), 0)
                    FROM payments p
                    INNER JOIN orders o ON p.order_id = o.order_id
                    WHERE p.payment_status = 'paid'
                        AND o.order_status IN ('placed', 'delivered', 'shipped', 'processing')
                ) AS total_revenue,
                -- totalCustomers: count of non-admin users
                (SELECT COUNT(*) FROM users WHERE user_role = 'customer') AS total_customers,
                -- pendingOrders: count of orders with status 'placed' (pending processing)
                (SELECT COUNT(*) FROM orders WHERE order_status = 'placed') AS pending_orders,
                -- lowStock: count of books with stock <= 5
                (SELECT COUNT(*) FROM character_books WHERE stock <= 5) AS low_stock
        `;

        const results = await sequelize.query(query, {
            type: QueryTypes.SELECT,
            plain: true
        });

        // Parse all values to numbers with safe defaults
        const overview = {
            totalProducts: Number(results?.total_products) || 0,
            totalOrders: Number(results?.total_orders) || 0,
            totalRevenue: Number(results?.total_revenue) || 0,
            totalCustomers: Number(results?.total_customers) || 0,
            pendingOrders: Number(results?.pending_orders) || 0,
            lowStock: Number(results?.low_stock) || 0
        };

        return {
            status: StatusCodes.OK,
            message: "Dashboard overview fetched successfully",
            data: overview
        };
    } catch (e) {
        console.error("Dashboard overview error:", e);
        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: e.message
        };
    }
};

// Get recent orders for admin
const getRecentOrders = async ({ limit = 10 } = {}) => {
    try {
        const orders = await Order.findAll({
            include: [
                { model: User, as: 'customer', attributes: ['user_id', 'name', 'email'] },
                { model: Payment, as: 'payment', attributes: ['payment_status', 'payment_received'] }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit)
        });

        return {
            status: StatusCodes.OK,
            message: "Recent orders fetched successfully",
            data: orders
        };
    } catch (e) {
        console.error("Get recent orders error:", e);
        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: e.message
        };
    }
};

// Get top selling products
const getTopSellingProducts = async ({ limit = 10 } = {}) => {
    try {
        // Find books that have been ordered
        const orders = await Order.findAll({
            attributes: [
                'comics'
            ],
            where: {
                order_status: { [require("sequelize").Op.not]: 'cancelled' }
            },
            order: [['created_at', 'DESC']],
            limit: 100
        });

        // Aggregate book counts from order comics JSONB
        const bookCounts = {};
        orders.forEach(order => {
            if (order.comics && Array.isArray(order.comics)) {
                order.comics.forEach(item => {
                    if (item.character_book_id) {
                        bookCounts[item.character_book_id] = (bookCounts[item.character_book_id] || 0) + item.quantity;
                    }
                });
            }
        });

        // Sort and get top selling
        const sortedBooks = Object.entries(bookCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, parseInt(limit));

        const bookIds = sortedBooks.map(([id]) => id);

        if (bookIds.length === 0) {
            return {
                status: StatusCodes.OK,
                message: "Top selling products fetched successfully",
                data: []
            };
        }

        const books = await CharacterBook.findAll({
            where: { id: bookIds },
            attributes: ['id', 'title', 'author', 'stock', 'image']
        });

        // Add sales count and sort by sales
        const booksWithSales = books.map(book => {
            const sales = bookCounts[book.id] || 0;
            return {
                id: book.id,
                title: book.title,
                author: book.author,
                stock: book.stock,
                image_url: book.image ? `/api/v1/uploads/comics/images/${book.image}` : null,
                sales_count: sales
            };
        }).sort((a, b) => b.sales_count - a.sales_count);

        return {
            status: StatusCodes.OK,
            message: "Top selling products fetched successfully",
            data: booksWithSales
        };
    } catch (e) {
        console.error("Get top selling products error:", e);
        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: e.message
        };
    }
};

// Get sales by period
const getSalesByPeriod = async ({ period = 'week' } = {}) => {
    try {
        let dateCondition;
        let groupBy;

        switch (period) {
            case 'day':
                dateCondition = "DATE(o.created_at) = CURRENT_DATE";
                groupBy = "DATE(o.created_at)";
                break;
            case 'month':
                dateCondition = "o.created_at >= CURRENT_DATE - INTERVAL '30 days'";
                groupBy = "DATE_TRUNC('day', o.created_at)";
                break;
            case 'year':
                dateCondition = "o.created_at >= CURRENT_DATE - INTERVAL '365 days'";
                groupBy = "DATE_TRUNC('month', o.created_at)";
                break;
            case 'week':
            default:
                dateCondition = "o.created_at >= CURRENT_DATE - INTERVAL '7 days'";
                groupBy = "DATE_TRUNC('day', o.created_at)";
                break;
        }

        const query = `
            SELECT
                ${groupBy} as period,
                COUNT(o.order_id) as order_count,
                COALESCE(SUM(p.payment_received), 0) as revenue
            FROM orders o
            INNER JOIN payments p ON p.order_id = o.order_id
            WHERE ${dateCondition}
                AND p.payment_status = 'paid'
                AND o.order_status NOT IN ('cancelled')
            GROUP BY ${groupBy}
            ORDER BY period ASC
        `;

        const results = await sequelize.query(query, { type: QueryTypes.SELECT });

        return {
            status: StatusCodes.OK,
            message: "Sales by period fetched successfully",
            data: results.map(r => ({
                period: r.period,
                order_count: Number(r.order_count) || 0,
                revenue: Number(r.revenue) || 0
            }))
        };
    } catch (e) {
        console.error("Get sales by period error:", e);
        return {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: e.message
        };
    }
};

module.exports = {
    getDashboardOverview,
    getRecentOrders,
    getTopSellingProducts,
    getSalesByPeriod
};