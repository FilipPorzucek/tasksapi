const jsonServer = require('json-server');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json')); // Używaj pliku db.json bezpośrednio

const middlewares = jsonServer.defaults();

server.use(middlewares);

// Dodaj przepisanie URL
server.use(jsonServer.rewriter({
    '/api/*': '/$1',
    '/blog/:resource/:id/show': '/:resource/:id'
}));

server.use(router);

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log('JSON Server is running on port', port);
});

// Export the Server API
module.exports = server;
