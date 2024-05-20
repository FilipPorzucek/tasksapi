const jsonServer = require('json-server');
const fs = require('fs');
const path = require('path');

const server = jsonServer.create();

// Odczytaj dane z pliku db.json
const filePath = path.join(__dirname, 'db.json');
const data = fs.readFileSync(filePath, 'utf-8');
const db = JSON.parse(data);

// Użyj danych z pliku db.json
const router = jsonServer.router(db);

const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.rewriter({
    '/api/*': '/$1',
    '/blog/:resource/:id/show': '/:resource/:id'
}));
server.use(router);

server.listen(3000, () => {
    console.log('JSON Server is running');
});

// Export the Server API
module.exports = server;