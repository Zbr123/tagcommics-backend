const adminCustomersController = require('../controllers/admin-customers.controller');
const { authenticate, authorizeRole } = require('../middleware/auth.middleware');
const ROLES = require('../enums/roles');

const adminCustomersRoutes = [
    // GET /api/v1/admin/customers
    // Query params: page, limit, search
    // Returns: { message, data: customers[], pagination }
    {
        url: '/admin/customers',
        method: 'GET',
        preHandler: [authenticate, authorizeRole(ROLES.ADMIN)],
        handler: adminCustomersController.getCustomersController,
    },

    // GET /api/v1/admin/customers/:id
    // Returns: { message, data: customer with orderHistory }
    {
        url: '/admin/customers/:id',
        method: 'GET',
        preHandler: [authenticate, authorizeRole(ROLES.ADMIN)],
        handler: adminCustomersController.getCustomerByIdController,
    }
];

module.exports = adminCustomersRoutes;

/*
Example curl commands:

# Get customers with pagination and search
curl -X GET "http://localhost:5000/api/v1/admin/customers?page=1&limit=20&search=john" \
  -H "Authorization: Bearer <admin_token>"

# Get single customer with order history
curl -X GET "http://localhost:5000/api/v1/admin/customers/<customer_id>" \
  -H "Authorization: Bearer <admin_token>"
*/