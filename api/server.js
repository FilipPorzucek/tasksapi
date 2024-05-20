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
fs.readFile('db.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading db.json:', err);
        return;
    }
    router.db.setState(JSON.parse(data));
    console.log('Data has been read from db.json');
});

// Obsługujemy zapisywanie zmian do pliku db.json w przypadku zmian w danych
server.use((req, res, next) => {
    router.render = (req, res) => {
        fs.writeFile('db.json', JSON.stringify(router.db.getState()), 'utf8', (err) => {
            if (err) {
                console.error('Error writing db.json:', err);
            } else {
                console.log('Data has been written to db.json');
            }
        });
        res.jsonp(res.locals.data);
    };
    next();
});

// Obsługa dodawania nowych danych
server.post('/api/tasks', (req, res) => {
    const newData = req.body;
    router.db.get('tasks').push(newData).write();
    res.jsonp(newData);
});

// Obsługa usuwania danych
server.delete('/api/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    router.db.get('tasks').remove({ id: taskId }).write();
    res.jsonp({ success: true });
});

// Obsługa aktualizowania danych
server.patch('/api/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const updatedData = req.body;
    router.db.get('tasks').find({ id: taskId }).assign(updatedData).write();
    res.jsonp(updatedData);
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`JSON Server is running on port ${port}`);
});