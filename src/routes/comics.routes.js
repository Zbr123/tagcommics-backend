const comicController = require("../controllers/comic.controller");
const { authenticate, authorizeAdmin } = require("../middleware/auth.middleware");

const comicsRoutes = [
    {
        url: "/comics",
        method: "POST",
        preHandler: [authenticate, authorizeAdmin],
        handler: comicController.createComicController,
    },
    {
        url: "/comics",
        method: "GET",
        handler: comicController.getComicController,
    },
    {
        url: "/comics",
        method: "DELETE",
        preHandler: [authenticate, authorizeAdmin],
        handler: comicController.deleteComicController,
    }
];

module.exports = comicsRoutes;
