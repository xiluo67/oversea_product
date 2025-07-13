const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const db = new sqlite3.Database('./db.sqlite');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Create users table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    phone TEXT
  )
`);

app.post('/api/register', async (req, res) => {
  const { username, password, phone } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  db.run(`INSERT INTO users (username, password, phone) VALUES (?, ?, ?)`,
    [username, hashedPassword, phone],
    function(err) {
      if (err) {
        return res.status(400).json({ message: "Username already exists." });
      }
      res.json({ message: "Registration successful!" });
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
  
    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
      if (err) {
        console.error('DB error:', err);
        return res.status(500).json({ message: "数据库错误" });
      }
  
      if (!user) {
        console.log('Login failed: user not found');
        return res.status(400).json({ message: "用户不存在" });
      }
  
      console.log('Trying to login with:', username, password);
      console.log('User from DB:', user);
  
      const valid = await bcrypt.compare(password, user.password);
      if (valid) {
        console.log('Login success!');
        return res.json({ success: true });
      } else {
        console.log('Login failed: invalid password');
        return res.status(401).json({ message: "密码错误" });
      }
    });
  });
  

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


