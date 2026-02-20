//all routes will be gathered here
const authRoutes = require('./auth.routes');
const testRoutes = require('./test.routes');
const comicsRoutes = require('./comics.routes');

const routes = [
    ...authRoutes,
    ...testRoutes,
    ...comicsRoutes
];
module.exports = { routes };