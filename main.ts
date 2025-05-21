// @deno-types="npm:@types/express@4.17.15"
import express from "npm:express";
import bcrypt from "npm:bcryptjs";
import jwt from "npm:jsonwebtoken";
import { DB } from "https://deno.land/x/sqlite/mod.ts"; // Direct import for SQLite
import { config } from "https://deno.land/x/dotenv/mod.ts";
const path = require('path');

const app = express();
app.use(express.json());

const env = config();

const db = new DB(env.DB_NAME);
db.query(`
    CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )
  `);

// Register user
app.post("/signup", (req, res) => {
  const { username, password } = req.body;
  try {
    db.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, password]);
    res.status(201).send("User created");
  } catch (e) {
    res.status(400).send("User already exists or error occurred");
  }
});

// Get all users
app.get("/users", (req, res) => {
  const users = [...db.query("SELECT id, username FROM users")].map(([id, username]) => ({ id, username }));
  res.json(users);
});

// Login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.use(express.static("public"));


// Start server
app.listen(8000, () => {
  console.log("Server is running on http://localhost:8000");
});
