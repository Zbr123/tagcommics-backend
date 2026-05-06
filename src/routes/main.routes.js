//all routes will be gathered here
const authRoutes = require('./auth.routes');
const testRoutes = require('./test.routes');
const comicsRoutes = require('./comics.routes');
const orderRoutes = require('./order.routes');
const characterRoutes = require('./character.routes');
const cartRoutes = require('./cart.routes');
const stripeRoutes = require('./stripe.routes');
const libraryRoutes = require('./library.routes');

const routes = [
    ...authRoutes,
    ...testRoutes,
    ...comicsRoutes,
    ...orderRoutes,
    ...characterRoutes,
    ...cartRoutes,
    ...stripeRoutes,
    ...libraryRoutes
];
module.exports = { routes };