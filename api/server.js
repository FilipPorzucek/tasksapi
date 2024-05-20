const jsonServer = require('json-server');
const path = require('path');
const fs = require('fs');
const server = jsonServer.create();
const filePath = path.join(__dirname, 'db.json');

if (!fs.existsSync(filePath)) {
  console.error('db.json file not found');
  process.exit(1);
}

const router = jsonServer.router(filePath);
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.rewriter({
  '/api/*': '/$1',
  '/blog/:resource/:id/show': '/:resource/:id'
}));
server.use(router);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});

module.exports = server;
