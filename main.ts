// @deno-types="npm:@types/express@4.17.15"
import express from "npm:express";
import supabase from "./db.js";
const path = require('path'); 

const app = express();
app.use(express.json());

app.get("/", async (req, res) => {
  res.send("Welcome to the User API!");
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
