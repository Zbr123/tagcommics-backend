//all routes will be gathered here
const authRoutes = require('./auth.routes');
const testRoutes = require('./test.routes');
const comicsRoutes = require('./comics.routes');
const orderRoutes = require('./order.routes');
const characterRoutes = require('./character.routes');

const routes = [
    ...authRoutes,
    ...testRoutes,
    ...comicsRoutes,
    ...orderRoutes,
    ...characterRoutes
];
module.exports = { routes };