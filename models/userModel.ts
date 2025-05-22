import supabase from "../db.js";
import { User } from "../types/index.ts";

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from("user")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !data) {
    console.error("Error fetching user:", error?.message);
    return null;
  }

  return data as User;
};

export const createUser = async (user: User): Promise<User | null> => {
  const { data, error } = await supabase
    .from("user")
    .insert(user)
    .select("*")
    .single();

  if (error || !data) {
    console.error("Error creating user:", error?.message);
    return null;
  }

  return data as User;
};