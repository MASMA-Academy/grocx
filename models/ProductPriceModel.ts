import supabase from "../db.js";
import { ProductPrice } from "../types/index.ts";

/**
 * Adds a new product price to the database.
 * @param priceData - The price data to add.
 * @returns A promise that resolves to the added ProductPrice object.
 */
export const addProductPrice = async (priceData: Omit<ProductPrice, "id" | "created_at">): Promise<ProductPrice | null> => {
  console.log("addProductPrice called with data:", priceData);
  
  try {
    const { data, error } = await supabase
      .from("product_price")
      .insert([priceData])
      .select()
      .single();
    
    console.log("Supabase insert result for product price:", { data, error });
    
    if (error) {
      console.error("Error adding product price:", error?.message);
      return null;
    }
    
    if (!data) {
      console.log("No data returned after inserting product price");
      return null;
    }
    
    return data as ProductPrice;
  } catch (insertError) {
    console.error("Exception in addProductPrice:", insertError);
    return null;
  }
}; 