// @ts-types="npm:@types/express@4.17.15"

import path from "node:path";
import { cors, dotenv, express, Request, Response } from "./deps.ts";
import { authRouter } from "./routes/authRoutes.ts";
import { productRouter } from "./routes/productRoutes.ts";
import { scanBarcodeRouter } from "./routes/scan-barcode.ts";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(authRouter);
app.use(productRouter);
app.use(scanBarcodeRouter);
// Home route
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Welcome to GROCX" });
});

// Login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'login.html'));
});

// Register page
app.get('/register', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'singup.html'));
});



app.use(express.static("public"));

export default app;
