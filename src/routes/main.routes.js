//all routes will be gathered here
const authRoutes = require('./auth.routes');
const testRoutes = require('./test.routes');
const comicsRoutes = require('./comics.routes');
const orderRoutes = require('./order.routes');
const characterRoutes = require('./character.routes');
const cartRoutes = require('./cart.routes');
const stripeRoutes = require('./stripe.routes');
const libraryRoutes = require('./library.routes');
const bookFeedRoutes = require('./book-feed.routes');
const designTeamRoutes = require('./design-team.routes');
const adminDashboardRoutes = require('./admin-dashboard.routes');
const adminOrdersRoutes = require('./admin-orders.routes');
const adminCustomersRoutes = require('./admin-customers.routes');

const routes = [
    ...authRoutes,
    ...testRoutes,
    ...comicsRoutes,
    ...orderRoutes,
    ...characterRoutes,
    ...cartRoutes,
    ...stripeRoutes,
    ...libraryRoutes,
    ...bookFeedRoutes,
    ...designTeamRoutes,
    ...adminDashboardRoutes,
    ...adminOrdersRoutes,
    ...adminCustomersRoutes
];
module.exports = { routes };