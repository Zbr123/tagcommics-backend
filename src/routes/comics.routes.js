const comicController = require("../controllers/comic.controller");
const { authenticate, authorizeAdmin } = require("../middleware/auth.middleware");

const comicsRoutes = [
    {
        url: "/comics",
        method: "POST",
        preHandler: [authenticate, authorizeAdmin],
        handler: comicController.createComicController,
    }
];

module.exports = comicsRoutes;
