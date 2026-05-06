const libraryController = require("../controllers/library.controller");
const { authenticate, authorizeRole } = require("../middleware/auth.middleware");
const ROLES = require("../enums/roles");

const libraryRoutes = [
  // Get user's library
  {
    url: "/library",
    method: "GET",
    preHandler: [authenticate, authorizeRole(ROLES.CUSTOMER)],
    handler: libraryController.getLibraryController,
  },

  // Check access to specific item
  {
    url: "/library/check-access",
    method: "GET",
    preHandler: [authenticate, authorizeRole(ROLES.CUSTOMER)],
    handler: libraryController.checkAccessController,
  },
];

module.exports = libraryRoutes;