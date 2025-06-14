
Цей проєкт складається з:
✅ `app.js` — головний серверний файл
✅ `pizza.db` — файл локальної бази даних SQLite (створюється автоматично)
✅ 📁 `static/` — папка, де знаходяться статичні файли, наприклад `index.html`, `style.css`, `script.js` тощо

---

### 📂 **Структура проєкту**
```
/папка_проєкту
├── app.js
├── pizza.db (створиться автоматично)
├── /static
│   ├── index.html
│   ├── style.css
│   └── script.js
```

### 🛠 **Що робить кожен файл?**
- `app.js`: запускає сервер, обробляє маршрути `/`, `/add`, `/delete` і підтягує статичні файли
- `pizza.db`: база, де зберігаються піци
- `static/index.html`: HTML-сторінка з формою додавання і таблицею піц (має містити `{{tableRows}}` для динамічного підставлення)
- `static/style.css`: стилі (опціонально)
- `static/script.js`: скрипти (опціонально)

---

### ⚙ **Як адаптувати під свою тему?**

1️⃣ **Змінити структуру таблиці в базі (app.js → initDatabase)**
```js
await db.run(`CREATE TABLE pizza (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, price REAL, ingredients TEXT, size TEXT);`);
```
Наприклад, для книги контактів:
```js
await db.run(`CREATE TABLE contacts (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, phone TEXT, email TEXT);`);
```

2️⃣ **Змінити HTML-форму (static/index.html)**
Ви редагуєте поля `<form>`:
```html
<input type="text" name="name" placeholder="Назва">
<input type="text" name="phone" placeholder="Телефон">
<input type="email" name="email" placeholder="Email">
```

3️⃣ **Змінити запити у коді (app.js → handleAddPizza / handleDeletePizza)**
```js
await db.run('INSERT INTO contacts (name, phone, email) VALUES (?, ?, ?)', [name, phone, email]);
await db.run('DELETE FROM contacts WHERE id = ?', [id]);
```

4️⃣ **Змінити виведення таблиці (app.js → getPizzaTableRows)**
```js
return contacts.map(c => `<tr><td>${c.name}</td><td>${c.phone}</td><td>${c.email}</td>...</tr>`).join('');
```

---

### 🚀 **Як запустити**
1️⃣ Встановіть залежності:
```
npm install sqlite sqlite3
```

2️⃣ Запустіть сервер:
```
node app.js
```

3️⃣ Відкрийте в браузері:
```
http://localhost:3000
```

---

### 💡 **Рекомендації**
✅ Зберігайте усі HTML, CSS, JS файли у папці `static`
✅ Перевіряйте, щоб у `index.html` було `{{tableRows}}` для підставлення даних
✅ Не перейменовуйте `pizza.db`, або змініть шлях у `app.js`

