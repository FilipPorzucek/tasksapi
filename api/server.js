const jsonServer = require('json-server');
const fs = require('fs');
const path = require('path');

const server = jsonServer.create();
const middlewares = jsonServer.defaults();

server.use(middlewares);

const router = jsonServer.router('db.json'); // Używamy pliku db.json bezpośrednio

server.use(jsonServer.rewriter({
    '/api/*': '/$1',
    '/blog/:resource/:id/show': '/:resource/:id'
}));
server.use(router);

// Wyłączamy zapisywanie do pliku db.json po każdym uruchomieniu serwera
// Czytamy dane z pliku db.json tylko raz, przy uruchomieniu serwera
let dataRead = false;

if (!dataRead) {
    fs.readFile('db.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading db.json:', err);
            return;
        }
        router.db.setState(JSON.parse(data));
        dataRead = true;
        console.log('Data has been read from db.json');
    });
}

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`JSON Server is running on port ${port}`);
});