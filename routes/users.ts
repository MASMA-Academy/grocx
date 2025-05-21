import express from "npm:express";
import { getUsers } from "../models/userModel.ts";

const app = express();
app.use(express.json());

app.get("/user", async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Internal Server Error");
  }
});