import supabase from "../db.js";
import { User } from "../types/index.ts";

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from("user")
    .select("*")
    .eq("email", email)
    .single(); // Assuming you want to get a single user by email

  if (error || !data) {
    console.error("Error fetching user:", error?.message);
    return null;
  }

  return data as User;
};
