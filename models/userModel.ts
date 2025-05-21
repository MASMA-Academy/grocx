import supabase from "../db.js";

export async function getUsers() {
  const { data, error } = await supabase
    .from("user")
    .select("*");

  if (error) {
    console.error("Error fetching users:", error.message);
    return;
  }

  console.log("Users:", data);
}

export async function getUserById(id:number) {
  const { data, error } = await supabase
    .from("user")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching user:", error.message);
    return;
  }

  console.log("User:", data);
}

export async function createUser(user:any) {
  const { data, error } = await supabase
    .from("user")
    .insert([user]);

  if (error) {
    console.error("Error creating user:", error.message);
    return;
  }

  console.log("User created:", data);
}   

export async function updateUser(id:number, user:any) {    
  const { data, error } = await supabase
    .from("user")
    .update(user)
    .eq("id", id);

  if (error) {
    console.error("Error updating user:", error.message);
    return;
  }

  console.log("User updated:", data);
}   