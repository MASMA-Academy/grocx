// @deno-types="npm:@types/express@4.17.15"
import express from "npm:express";
import supabase from "./db.js";

const app = express();
app.use(express.json());

async function getUsers() {
  const { data, error } = await supabase
    .from('user')
    .select('*'); 

  //   const { data, error } = await supabase
  // .from('user')
  // .insert([
  //   { email: 'azizul@azizul.com', name: 'Azizul', password: "12345678" },
  // ])
  // .select()
  if (error) {
    console.error('Error fetching users:', error.message);
    return;
  }

  console.log('Users:', data);
}

getUsers();

// app.get("/", async (req, res) => {
//   try {
//     const users = await getUsers();
//     res.json(users);
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// Start server
app.listen(8000, () => {
  console.log("Server is running on http://localhost:8000");
});
