const jsonServer = require('json-server');
const axios = require('axios');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const server = jsonServer.create();
const middlewares = jsonServer.defaults();
server.use(bodyParser.json());
server.use(middlewares);

// Ustaw zmienne środowiskowe
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_FILE_PATH = process.env.GITHUB_FILE_PATH;

// Endpoint do pobierania danych
server.get('/api/tasks', async (req, res) => {
    try {
        const response = await axios.get(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });
        const content = Buffer.from(response.data.content, 'base64').toString();
        const db = JSON.parse(content);
        res.jsonp(db.tasks);
    } catch (error) {
        console.error('Error fetching data from GitHub:', error.response.data);
        res.status(500).json({ error: 'Failed to fetch tasks from GitHub' });
    }
});

// Endpoint do dodawania nowych danych
server.post('/api/tasks', async (req, res) => {
    try {
        const response = await axios.get(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });
        const content = Buffer.from(response.data.content, 'base64').toString();
        const db = JSON.parse(content);
        
        const newData = req.body;
        newData.id = db.tasks.length ? db.tasks[db.tasks.length - 1].id + 1 : 1;
        db.tasks.push(newData);
        
        await axios.put(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
            message: 'Update db.json',
            content: Buffer.from(JSON.stringify(db, null, 2)).toString('base64'),
            sha: response.data.sha
        }, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });

        res.jsonp(newData);
    } catch (error) {
        console.error('Error adding task to GitHub:', error.response.data);
        res.status(500).json({ error: 'Failed to add task to GitHub' });
    }
});

// Endpoint do usuwania danych
server.delete('/api/tasks/:id', async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        const response = await axios.get(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });
        const content = Buffer.from(response.data.content, 'base64').toString();
        const db = JSON.parse(content);

        db.tasks = db.tasks.filter(task => task.id !== taskId);
        
        await axios.put(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
            message: 'Update db.json',
            content: Buffer.from(JSON.stringify(db, null, 2)).toString('base64'),
            sha: response.data.sha
        }, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });

        res.jsonp({ success: true });
    } catch (error) {
        console.error('Error deleting task from GitHub:', error.response.data);
        res.status(500).json({ error: 'Failed to delete task from GitHub' });
    }
});

// Endpoint do aktualizowania danych
server.patch('/api/tasks/:id', async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        const updatedData = req.body;
        const response = await axios.get(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });
        const content = Buffer.from(response.data.content, 'base64').toString();
        const db = JSON.parse(content);

        db.tasks = db.tasks.map(task => (task.id === taskId ? { ...task, ...updatedData } : task));

        await axios.put(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
            message: 'Update db.json',
            content: Buffer.from(JSON.stringify(db, null, 2)).toString('base64'),
            sha: response.data.sha
        }, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });

        res.jsonp(updatedData);
    } catch (error) {
        console.error('Error updating task on GitHub:', error.response.data);
        res.status(500).json({ error: 'Failed to update task on GitHub' });
    }
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`JSON Server is running on port ${port}`);
});