const comicController = require("../controllers/comic.controller");
const { authenticate, authorizeAdmin } = require("../middleware/auth.middleware");

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
        preHandler: [authenticate, authorizeAdmin],
        handler: comicController.createComicController,
    },
    {
        url: "/comics",
        method: "DELETE",
        preHandler: [authenticate, authorizeAdmin],
        handler: comicController.deleteComicController,
    },
];

module.exports = comicsRoutes;