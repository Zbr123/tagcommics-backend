const comicController = require("../controllers/comic.controller");
const { authenticate, authorizeRole } = require("../middleware/auth.middleware");
const ROLES = require("../enums/roles");

const comicsRoutes = [
    {
        url: "/comics",
        method: "POST",
        preHandler: [authenticate, authorizeRole(ROLES.ADMIN)],
        handler: comicController.createComicController,
    },
    {
        url: "/comics",
        method: "GET",
        handler: comicController.getComicController,
    },
    {
        url: "/comics/by-character/:character_id",
        method: "GET",
        handler: comicController.getComicsByCharacterController,
    },
    {
        url: "/comics",
        method: "DELETE",
        preHandler: [authenticate, authorizeRole(ROLES.ADMIN)],
        handler: comicController.deleteComicController,
    }
];

module.exports = comicsRoutes;
