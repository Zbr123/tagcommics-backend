const adminDashboardController = require('../controllers/admin-dashboard.controller');
const { authenticate, authorizeRole } = require('../middleware/auth.middleware');
const ROLES = require('../enums/roles');

const adminDashboardRoutes = [
    // GET /api/v1/admin/dashboard/overview
    // Returns: totalProducts, totalOrders, totalRevenue, totalCustomers, pendingOrders, lowStock
    {
        url: '/admin/dashboard/overview',
        method: 'GET',
        preHandler: [authenticate, authorizeRole(ROLES.ADMIN)],
        handler: adminDashboardController.getDashboardOverviewController,
    },

    // GET /api/v1/admin/dashboard/recent-orders
    // Returns: Recent orders with customer and payment info
    {
        url: '/admin/dashboard/recent-orders',
        method: 'GET',
        preHandler: [authenticate, authorizeRole(ROLES.ADMIN)],
        handler: adminDashboardController.getRecentOrdersController,
    },

    // GET /api/v1/admin/dashboard/top-products
    // Returns: Top selling products by order count
    {
        url: '/admin/dashboard/top-products',
        method: 'GET',
        preHandler: [authenticate, authorizeRole(ROLES.ADMIN)],
        handler: adminDashboardController.getTopSellingProductsController,
    },

    // GET /api/v1/admin/dashboard/sales?period=week|month|year
    // Returns: Sales data grouped by period
    {
        url: '/admin/dashboard/sales',
        method: 'GET',
        preHandler: [authenticate, authorizeRole(ROLES.ADMIN)],
        handler: adminDashboardController.getSalesByPeriodController,
    }
];

module.exports = adminDashboardRoutes;

/*
Example usage:
curl -H "Authorization: Bearer <admin_token>" http://localhost:5000/api/v1/admin/dashboard/overview
*/