const jsonServer = require('json-server');
const axios = require('axios');

const server = jsonServer.create();

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

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`JSON Server is running on port ${port}`);
});