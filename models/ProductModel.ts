import supabase from "../db.js";
import { Product } from "../types/index.ts";

/**
 * Finds a product by its barcode.
 * @param barcode - The barcode of the product to find.
 * @returns A promise that resolves to the Product object or null if not found or an error occurs.
 */
export const findProductByBarcode = async (barcode: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from("product") // Your table name is 'product'
    .select("id, created_at, barcode, name, brand, description, category") // Specify columns
    .eq("barcode", barcode)
    .single(); // Expecting one product per barcode
    console.log(data);

  if (error) {
    console.error("Error fetching product by barcode:", error?.message);
    return null;
  }
  
  if (!data) {
    // It's not an error if the barcode doesn't match any product, just means not found.
    return null;
  }

  return data as Product;
}; 