export interface User {
  email: string;
  password: string;
}

export interface Product {
  id: number; // Assuming id is a number, adjust if it's UUID or string
  created_at: string; // Assuming timestamp is stored as string, adjust if Date object
  barcode: string;
  name: string;
  brand: string | null; // Assuming brand can be optional
  description: string | null; // Assuming description can be optional
  category: string | null; // Assuming category can be optional
}