const bookFeedController = require('../controllers/book-feed.controller');

const bookFeedRoutes = [
    // Latest Releases - books with book_type = 'New Item'
    {
        url: '/books/latest-releases',
        method: 'GET',
        handler: bookFeedController.getLatestReleasesController,
    },

    // Flash Sale - books with book_type = 'Flash Sale'
    {
        url: '/books/flash-sale',
        method: 'GET',
        handler: bookFeedController.getFlashSaleController,
    },

    // Popular Books - books with review >= 4.0
    {
        url: '/books/popular',
        method: 'GET',
        handler: bookFeedController.getPopularBooksController,
    },

    // All Books - browse with pagination
    {
        url: '/books',
        method: 'GET',
        handler: bookFeedController.getAllBooksController,
    }
];

module.exports = bookFeedRoutes;