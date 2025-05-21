import { Request, Response } from "../deps.ts";
import { bcrypt } from "../deps.ts";
import { findUserByEmail } from "../models/userModel.ts";

// export const register = async (req: Request, res: Response) => {
//   try {
//     const { username, email, password } = req.body;

//     // Check if user already exists
//     const existingUser = await findUserByEmail(email);
//     if (existingUser) {
//       return res.status(400).json({
//         message: "User already exists with this email",
//       });
//     }

//     Create new user
//     const user = await createUser({ username, email, password })

//     res.status(201).json({
//       id: user.id,
//       username: user.username,
//       email: user.email,
//     });
//   } catch (error: unknown) {
//     const errorMessage = error instanceof Error
//       ? error.message
//       : "An unknown error occurred";
//     res.status(500).json({ message: errorMessage });
//   }
// };

export const login = async (req: Request, res: Response) => {
    console.log("Login request received");
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      email: user.email
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error
      ? error.message
      : "An unknown error occurred";
    res.status(500).json({ message: errorMessage });
  }
};