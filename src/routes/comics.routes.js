const comicController = require("../controllers/comic.controller");
const { authenticate, authorizeRole } = require("../middleware/auth.middleware");
const ROLES = require("../enums/roles");

const comicsRoutes = [
    // Public endpoints
    {
        url: "/comics",
        method: "GET",
        handler: comicController.getComicsController,
    },
    {
        url: "/comics/featured",
        method: "GET",
        handler: comicController.getFeaturedComicsController,
    },
    {
        url: "/comics/new-releases",
        method: "GET",
        handler: comicController.getNewReleasesController,
    },
    {
        url: "/comics/best-sellers",
        method: "GET",
        handler: comicController.getBestSellersController,
    },
    {
        url: "/comics/category/:category",
        method: "GET",
        handler: comicController.getByCategoryController,
    },
    {
        url: "/comics/search",
        method: "GET",
        handler: comicController.searchComicsController,
    },
    {
        url: "/comics/:id",
        method: "GET",
        handler: comicController.getComicByIdController,
    },

    // Admin only endpoints
    {
        url: "/comics",
        method: "POST",
        preHandler: [authenticate, authorizeRole(ROLES.ADMIN)],
        handler: comicController.createComicController,
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
    },
];

module.exports = comicsRoutes;