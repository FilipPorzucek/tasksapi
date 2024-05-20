const jsonServer = require('json-server');
const axios = require('axios');
const bodyParser = require('body-parser');

const server = jsonServer.create();
const middlewares = jsonServer.defaults();

// Middleware to parse JSON bodies
server.use(bodyParser.json());
server.use(middlewares);

// Middleware to authenticate requests
server.use(async (req, res, next) => {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        return res.status(401).json({ error: 'GitHub token is missing' });
    }
    req.headers.Authorization = `token ${token}`;
    next();
});

// GitHub repo details
const repo = process.env.GITHUB_REPO;
const filePath = process.env.GITHUB_FILE_PATH;

// Function to fetch data from GitHub
const fetchDataFromGitHub = async () => {
    try {
        const { data } = await axios.get(`https://api.github.com/repos/${repo}/contents/${filePath}`);
        return Buffer.from(data.content, 'base64').toString();
    } catch (error) {
        console.error('Error fetching data from GitHub:', error.response.data);
        throw new Error('Error fetching data from GitHub');
    }
};

// Function to save data to GitHub
const saveDataToGitHub = async (data) => {
    try {
        const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
        const { data: fileData } = await axios.get(`https://api.github.com/repos/${repo}/contents/${filePath}`);
        await axios.put(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
            message: 'Update data',
            content: content,
            sha: fileData.sha,
        });
        console.log('Data has been written to GitHub');
    } catch (error) {
        console.error('Error writing to GitHub:', error.response.data);
        throw new Error('Error writing to GitHub');
    }
};

// Endpoint to get all tasks
server.get('/api/tasks', async (req, res) => {
    try {
        const dbData = await fetchDataFromGitHub();
        res.jsonp(JSON.parse(dbData).tasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks from GitHub' });
    }
});

// Endpoint to add a new task
server.post('/api/tasks', async (req, res) => {
    try {
        const dbData = await fetchDataFromGitHub();
        const newData = req.body;
        newData.id = JSON.parse(dbData).tasks.length ? JSON.parse(dbData).tasks[JSON.parse(dbData).tasks.length - 1].id + 1 : 1;
        JSON.parse(dbData).tasks.push(newData);
        await saveDataToGitHub(JSON.parse(dbData));
        res.jsonp(newData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add task to GitHub' });
    }
});

// Endpoint to delete a task
server.delete('/api/tasks/:id', async (req, res) => {
    try {
        const dbData = await fetchDataFromGitHub();
        const taskId = parseInt(req.params.id);
        JSON.parse(dbData).tasks = JSON.parse(dbData).tasks.filter(task => task.id !== taskId);
        await saveDataToGitHub(JSON.parse(dbData));
        res.jsonp({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete task from GitHub' });
    }
});

// Endpoint to update a task
server.patch('/api/tasks/:id', async (req, res) => {
    try {
        const dbData = await fetchDataFromGitHub();
        const taskId = parseInt(req.params.id);
        const updatedData = req.body;
        JSON.parse(dbData).tasks = JSON.parse(dbData).tasks.map(task => (task.id === taskId ? { ...task, ...updatedData } : task));
        await saveDataToGitHub(JSON.parse(dbData));
        res.jsonp(updatedData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update task on GitHub' });
    }
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`JSON Server is running on port ${port}`);
});