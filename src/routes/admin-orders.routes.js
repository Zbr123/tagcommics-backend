const adminOrdersController = require('../controllers/admin-orders.controller');
const { authenticate, authorizeRole } = require('../middleware/auth.middleware');
const ROLES = require('../enums/roles');

const adminOrdersRoutes = [
    // GET /api/v1/admin/orders
    // Query params: page, limit, search, status, paymentStatus, startDate, endDate
    // Returns: { message, data: orders[], pagination }
    {
        url: '/admin/orders',
        method: 'GET',
        preHandler: [authenticate, authorizeRole(ROLES.ADMIN)],
        handler: adminOrdersController.getOrdersController,
    },

    // GET /api/v1/admin/orders/:id
    // Returns: { message, data: order }
    {
        url: '/admin/orders/:id',
        method: 'GET',
        preHandler: [authenticate, authorizeRole(ROLES.ADMIN)],
        handler: adminOrdersController.getOrderByIdController,
    },

    // PATCH /api/v1/admin/orders/:id/status
    // Body: { status: 'placed'|'processing'|'shipped'|'delivered'|'cancelled' }
    // Returns: { message, data: order }
    // Note: Auto-generates tracking number if shipped without one
    // Note: If delivered and COD, payment status auto-set to 'paid'
    {
        url: '/admin/orders/:id/status',
        method: 'PATCH',
        preHandler: [authenticate, authorizeRole(ROLES.ADMIN)],
        handler: adminOrdersController.updateOrderStatusController,
    },

    // PATCH /api/v1/admin/orders/:id/payment-status
    // Body: { paymentStatus: 'pending'|'paid'|'failed' }
    // Returns: { message, data: order }
    {
        url: '/admin/orders/:id/payment-status',
        method: 'PATCH',
        preHandler: [authenticate, authorizeRole(ROLES.ADMIN)],
        handler: adminOrdersController.updatePaymentStatusController,
    },

    // PATCH /api/v1/admin/orders/:id/tracking
    // Body: { trackingNumber: string }
    // Returns: { message, data: order }
    {
        url: '/admin/orders/:id/tracking',
        method: 'PATCH',
        preHandler: [authenticate, authorizeRole(ROLES.ADMIN)],
        handler: adminOrdersController.updateTrackingController,
    },

    // PATCH /api/v1/admin/orders/:id/notes
    // Body: { notes: string }
    // Returns: { message, data: order }
    {
        url: '/admin/orders/:id/notes',
        method: 'PATCH',
        preHandler: [authenticate, authorizeRole(ROLES.ADMIN)],
        handler: adminOrdersController.updateOrderNotesController,
    }
];

module.exports = adminOrdersRoutes;

/*
Example curl commands:

# Get orders with pagination and filters
curl -X GET "http://localhost:5000/api/v1/admin/orders?page=1&limit=20&status=Pending" \
  -H "Authorization: Bearer <admin_token>"

# Get single order
curl -X GET "http://localhost:5000/api/v1/admin/orders/<order_id>" \
  -H "Authorization: Bearer <admin_token>"

# Update order status
curl -X PATCH "http://localhost:5000/api/v1/admin/orders/<order_id>/status" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "shipped"}'

# Update payment status
curl -X PATCH "http://localhost:5000/api/v1/admin/orders/<order_id>/payment-status" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"paymentStatus": "paid"}'

# Update tracking number
curl -X PATCH "http://localhost:5000/api/v1/admin/orders/<order_id>/tracking" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"trackingNumber": "TRK123456789"}'
*/