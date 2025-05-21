import app from "./app.ts";

const PORT = Deno.env.get("PORT") || 8000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
