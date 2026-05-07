const designTeamController = require('../controllers/design-team.controller');
const { validateContactRequest } = require('../validators/design-team.validator');
const { authenticate, authorizeRole } = require('../middleware/auth.middleware');
const ROLES = require('../enums/roles');

const designTeamRoutes = [
  // POST /design-team/contact - Public (server-to-server from Next)
  {
    url: '/design-team/contact',
    method: 'POST',
    preHandler: [validateContactRequest],
    handler: designTeamController.submitContactController,
  },

  // GET /design-team/inquiries - Admin only
  {
    url: '/design-team/inquiries',
    method: 'GET',
    preHandler: [authenticate, authorizeRole(ROLES.ADMIN)],
    handler: designTeamController.getAllInquiriesController,
  },

  // GET /design-team/inquiries/:id - Admin only
  {
    url: '/design-team/inquiries/:id',
    method: 'GET',
    preHandler: [authenticate, authorizeRole(ROLES.ADMIN)],
    handler: designTeamController.getInquiryByIdController,
  }
];

module.exports = designTeamRoutes;