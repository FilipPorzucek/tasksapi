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

// Wczytujemy dane z pliku db.json tylko raz, przy uruchomieniu serwera
let dataRead = false;
fs.readFile('db.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading db.json:', err);
        return;
    }
    router.db.setState(JSON.parse(data));
    dataRead = true;
    console.log('Data has been read from db.json');
});

// Obsługujemy zapisywanie zmian do pliku db.json w przypadku zmian w danych
router.render = (req, res) => {
    if (dataRead) {
        fs.writeFile('db.json', JSON.stringify(router.db.getState()), 'utf8', (err) => {
            if (err) {
                console.error('Error writing db.json:', err);
            } else {
                console.log('Data has been written to db.json');
            }
        });
    }
    res.jsonp(res.locals.data);
};

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`JSON Server is running on port ${port}`);
});