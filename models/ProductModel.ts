// models/productModel.ts
import supabase from "../db.js";
import { Product } from "../types/index.ts";

/**
 * Finds a product by its barcode.
 * @param barcode - The barcode of the product to find.
 * @returns A promise that resolves to the Product object or null if not found or an error occurs.
 */
export const findProductByBarcode = async (barcode: string): Promise<Product | null> => {
  console.log("findProductByBarcode called with barcode:", barcode);
  console.log("Supabase instance:", !!supabase);
  
  try {
    const { data, error } = await supabase
      .from("product") // Your table name is 'product'
      .select("id, created_at, barcode, name, brand, description, category") // Specify columns
      .eq("barcode", barcode)
      .single(); // Expecting one product per barcode
     
    console.log("Supabase query result for barcode:", { data, error });

    if (error) {
      // If error is due to no rows found by .single(), it's a valid "not found" scenario
      if (error.code === 'PGRST116') { 
        console.log("No product found with barcode (PGRST116):", barcode);
        return null;
      }
      console.error("Error fetching product by barcode:", error?.message);
      return null;
    }
    
    return data as Product; // data will be null if not found by .single() without erroring if no rows is not an error
  } catch (fetchError) {
    console.error("Exception in findProductByBarcode:", fetchError);
    return null;
  }
};

/**
 * Finds products by a search query matching name or barcode.
 * @param query - The search string.
 * @returns A promise that resolves to an array of Product objects.
 */
export const findProductsByQuery = async (query: string): Promise<Product[]> => {
  console.log("findProductsByQuery called with query:", query);
  const searchTerm = `%${query}%`; // Prepare for ILIKE (case-insensitive partial match)

  try {
    const { data, error } = await supabase
      .from("product")
      .select("id, created_at, barcode, name, brand, description, category")
      // Using .or() to match against name (case-insensitive) or barcode (exact match)
      .or(`name.ilike.${searchTerm},barcode.eq.${query}`);

    if (error) {
      console.error("Error fetching products by query:", error?.message);
      throw error; // Throw error to be caught by controller
    }

    console.log("Products found by query:", data?.length || 0);
    return (data as Product[]) || []; // Ensure an array is always returned

  } catch (fetchError) {
    console.error("Exception in findProductsByQuery:", fetchError);
    throw fetchError; // Re-throw error to be caught by controller
  }
};

export const addProductToDatabase = async (productData: Omit<Product, "id" | "created_at">): Promise<Product | null> => {
  const { data, error } = await supabase
    .from("product")
    .insert([productData])
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
