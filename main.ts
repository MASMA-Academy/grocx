// @deno-types="npm:@types/express@4.17.15"
import express from "npm:express";
import supabase from "./db.js";

const app = express();
app.use(express.json());

app.get("/", async (req, res) => {
  res.send("Welcome to the User API!");
});

// Start server
app.listen(8000, () => {
  console.log("Server is running on http://localhost:8000");
});
