// models/productModel.ts
import supabase from "../db.js";

export interface Product {
  barcode: string;
  name: string;
  brand: string;
  description: string;
  category: string;
}

export const findProductByBarcode = async (barcode: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from("product")
    .select("*")
    .eq("barcode", barcode)
    .single();

  if (error || !data) {
    console.error("Error fetching product:", error?.message);
    return null;
  }

  return data as Product;
};

export const addProductToDatabase = async (product: Product): Promise<Product | null> => {
  const { data, error } = await supabase
    .from("product")
    .insert([product])
    .select()
    .single();

  if (error || !data) {
    console.error("Error adding product:", error?.message);
    return null;
  }

  return data as Product;
};

export const deleteProductFromDatabase = async (barcode: string): Promise<boolean> => {
  const { error } = await supabase
    .from("product")
    .delete()
    .eq("barcode", barcode);

  if (error) {
    console.error("Error deleting product:", error.message);
    return false;
  }

  return true;
}
