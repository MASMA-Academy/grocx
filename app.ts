import path from "node:path";
import { cors, dotenv, express, Request, Response } from "./deps.ts";
import { authRouter } from "./routes/authRoutes.ts";
import { productRouter } from "./routes/productRoutes.ts";
import { findUserByEmail } from "./models/userModel.ts";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/product", productRouter);
// Home route
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Welcome to GROCX" });
});

// Login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(Deno.cwd(), 'public', 'login.html'));
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please fill in all fields." });
  }

  try {
    const user = await findUserByEmail(email);
    if (user && user.password === password) { // You should hash passwords in real applications
      return res.status(200).json({ message: "Login successful", user });
    } else {
      return res.status(401).json({ message: "Invalid email or password." });
    }
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.use(express.static("public"));

export default app;