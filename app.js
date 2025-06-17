const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const sqlite3 = require('sqlite3').verbose();
const dbWrapper = require('sqlite');

const staticDir = path.join(__dirname, 'static');
const indexHtmlPath = path.join(staticDir, 'index.html');
const dbFile = './posts.db';
let db;

async function initDatabase() {
    const dbExists = fs.existsSync(dbFile);

    db = await dbWrapper.open({ filename: dbFile, driver: sqlite3.Database });

    if (!dbExists) {
        console.log('База не найдена — создаем новую базу и таблицу posts...');
        await db.run(`CREATE TABLE posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user TEXT,
            content TEXT
        );`);
        console.log('Таблица posts создана.');
    } else {
        console.log('База уже существует — используем существующую.');
    }
}


async function getPosts() {
    const posts = await db.all('SELECT * FROM posts ORDER BY id DESC');
    return posts.map(p => `
        <div class="post-card">
            <div class="post-header">${p.user}</div>
            <div class="post-content"><pre>${p.content}</pre></div>
            <form action="/delete" method="POST" class="delete-form">
                <input type="hidden" name="id" value="${p.id}">
                <button type="submit" class="delete-btn">Delete</button>
            </form>
        </div>
    `).join('');
}

async function handleHomePage(res) {
    if (fs.existsSync(indexHtmlPath)) {
        const html = fs.readFileSync(indexHtmlPath, 'utf8');
        const tableRows = await getPosts();
        res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
        res.end(html.replace('{{tableRows}}', tableRows));
    } else {
        res.writeHead(500);
        res.end('Помилка: файл index.html не знайдено. Переконайтеся, що він є у папці static.');
    }
}

function parseRequestBody(req) {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => { resolve(querystring.parse(body)); });
    });
}

async function handleAddPost(req, res) {
    const data = await parseRequestBody(req);
    const { user, content } = data;
    try {
        await db.run('INSERT INTO posts (user, content) VALUES (?, ?)', [user, content]);
        res.writeHead(302, { Location: '/' });
        res.end();
    } catch (err) {
        console.error('Помилка додавання поста:', err);
        res.writeHead(500);
        res.end('Помилка додавання даних');
    }
}

async function handleDeletePost(req, res) {
    const data = await parseRequestBody(req);
    const { id } = data;
    try {
        await db.run('DELETE FROM posts WHERE id = ?', [id]);
        res.writeHead(302, { Location: '/' });
        res.end();
    } catch (err) {
        console.error('Помилка видалення поста:', err);
        res.writeHead(500);
        res.end('Помилка видалення');
    }
}

function serveStaticFile(req, res) {
    const filePath = path.join(staticDir, req.url);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        const mimeTypes = {
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.ico': 'image/x-icon'
        };
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
    } else {
        res.writeHead(404);
        res.end('Не знайдено');
    }
}

async function main() {
    await initDatabase();
    const server = http.createServer(async (req, res) => {
        if (req.method === 'GET' && req.url === '/') {
            await handleHomePage(res);
        } else if (req.method === 'POST' && req.url === '/add') {
            await handleAddPost(req, res);
        } else if (req.method === 'POST' && req.url === '/delete') {
            await handleDeletePost(req, res);
        } else if (req.method === 'GET') {
            serveStaticFile(req, res);
        } else {
            res.writeHead(404);
            res.end('Не знайдено');
        }
    });

    server.listen(3000, () => {
        console.log('Сервер запущено на http://localhost:3000');
    });
}

main();
