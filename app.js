// ... попередні імпорти залишаються без змін

async function initDatabase() {
    const exists = fs.existsSync(dbFile);
    db = await dbWrapper.open({ filename: dbFile, driver: sqlite3.Database });
    if (!exists) {
        await db.run(`CREATE TABLE posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user TEXT,
            content TEXT
        );`);
        console.log('База даних та таблиця "posts" створені.');
    }
}

async function getPosts() {
    const posts = await db.all('SELECT * FROM posts');
    return posts.map(p => `
        <tr>
            <td>${p.user}</td>
            <td>${p.content}</td>
            <td>
                <form action="/delete" method="POST" style="display:inline;">
                    <input type="hidden" name="id" value="${p.id}">
                    <button type="submit">Видалити</button>
                </form>
            </td>
        </tr>
    `).join('');
}

async function handleAddPost(req, res) {
    const data = await parseRequestBody(req);
    const { user, content } = data;
    try {
        await db.run('INSERT INTO posts (user, content) VALUES (?, ?)', [user, content]);
        res.writeHead(302, { Location: '/' });
        res.end();
    } catch (err) {
        console.error(err);
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
        console.error(err);
        res.writeHead(500);
        res.end('Помилка видалення');
    }
}

// ... решта коду main та serveStaticFile не змінюється
