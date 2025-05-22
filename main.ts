// @deno-types="npm:@types/express@4.17.15"
import express from "npm:express";
import client from "./db.ts";

const app = express();
app.use(express.json());


try {
    const result = await client.queryObject("SELECT * FROM \"user\"");
    console.log(result.rows);
  } catch (error) {
    console.error("Query error:", error);
  }


// Start server
app.listen(8000, () => {
  console.log("Server is running on http://localhost:8000");
});
