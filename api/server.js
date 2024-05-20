const jsonServer = require('json-server');
const fs = require('fs');
const path = require('path');

const server = jsonServer.create();
const middlewares = jsonServer.defaults();

// Ścieżka do pliku db.json (zakładając, że jest poza folderem api)
const dbFilePath = path.join(__dirname, '..', 'db.json');

// Wczytaj dane z pliku db.json
let db = {};

try {
    const dbData = fs.readFileSync(dbFilePath, 'utf8');
    db = JSON.parse(dbData);
} catch (error) {
    console.error('Error reading db.json:', error);
}

// Utwórz router JSON Server z danymi z pliku db.json
const router = jsonServer.router(db);

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Dodaj rewriter middleware
server.use(jsonServer.rewriter({
    '/api/*': '/$1',
    '/blog/:resource/:id/show': '/:resource/:id'
}));

// Obsługa dodawania nowych danych
server.post('/api/tasks', (req, res, next) => {
    const newData = req.body;
    db.tasks.push(newData);
    saveDataToDB();
    res.jsonp(newData);
});

// Obsługa usuwania danych
server.delete('/api/tasks/:id', (req, res, next) => {
    const taskId = parseInt(req.params.id);
    db.tasks = db.tasks.filter(task => task.id !== taskId);
    saveDataToDB();
    res.jsonp({ success: true });
});

// Obsługa aktualizowania danych
server.patch('/api/tasks/:id', (req, res, next) => {
    const taskId = parseInt(req.params.id);
    const updatedData = req.body;
    db.tasks = db.tasks.map(task => (task.id === taskId ? { ...task, ...updatedData } : task));
    saveDataToDB();
    res.jsonp(updatedData);
});

// Funkcja do zapisywania danych do pliku db.json
function saveDataToDB() {
    fs.writeFile(dbFilePath, JSON.stringify(db, null, 2), 'utf8', err => {
        if (err) {
            console.error('Error writing db.json:', err);
        } else {
            console.log('Data has been written to db.json');
        }
    });
}

server.use(router);

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`JSON Server is running on port ${port}`);
});