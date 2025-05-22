import { Request, Response } from "../deps.ts";
import { bcryptjs } from "../deps.ts";
import { findUserByEmail,createUser } from "../models/userModel.ts";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
console.log("BODY:", req.body);

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email",
      });
    }

    // Create new user
    const user = await createUser({ name, email, password });
    if (!user) {
      return res.status(500).json({
        message: "Error creating user",
      });
    }

    // Check password
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.redirect("/scan-barcode");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error
      ? error.message
      : "An unknown error occurred";
    res.status(500).json({ message: errorMessage });
  }
};

export const login = async (req: Request, res: Response) => {
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
};