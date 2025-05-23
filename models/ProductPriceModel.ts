import supabase from "../db.js";
import { ProductPrice, Product, Store } from "../types/index.ts";

// Interface for the combined data structure
export interface FullPriceEntry extends ProductPrice {
  product_name: string | null;
  product_barcode: string | null;
  product_brand: string | null;
  store_name: string | null;
  store_location: string | null;
}

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

/**
 * Fetches all product price entries with product and store details.
 * @returns A promise that resolves to an array of FullPriceEntry objects.
 */
export const fetchAllPriceEntries = async (): Promise<FullPriceEntry[]> => {
  console.log("fetchAllPriceEntries called - Attempting to fetch all price entries with joins.");
  try {
    // Corrected Supabase select for joins
    const { data, error } = await supabase
      .from("product_price") 
      .select(`
        id,
        created_at,
        price,
        currency,
        product_id, 
        store_id,
        product: product( name, barcode, brand ), 
        store: store( name, location )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error fetching all price entries:", JSON.stringify(error, null, 2));
      // Throw a more detailed error to be caught by the controller
      throw new Error(`Database query failed: ${error.message}. Hint: ${error.hint || 'N/A'}. Details: ${error.details || 'N/A'}`);
    }

    if (!data) {
      console.log("No data returned from fetchAllPriceEntries query.");
      return [];
    }

    // Manually map the data to the FullPriceEntry structure
    const fullEntries: FullPriceEntry[] = data.map((item: any) => ({
      id: item.id,
      created_at: item.created_at,
      product_id: item.product_id,
      store_id: item.store_id,
      price: item.price,
      currency: item.currency,
      product_name: item.product?.name || null,
      product_barcode: item.product?.barcode || null,
      product_brand: item.product?.brand || null,
      store_name: item.store?.name || null,
      store_location: item.store?.location || null,
    }));

    console.log("Successfully fetched and mapped all price entries:", fullEntries.length);
    return fullEntries;

  } catch (fetchError: any) {
    console.error("Exception caught in fetchAllPriceEntries:", fetchError.message);
    throw new Error(fetchError.message || "An unknown error occurred in fetchAllPriceEntries"); 
  }
};

/**
 * Fetches price history for a specific product, including store details.
 * @param productId - The ID of the product to fetch price history for.
 * @returns A promise that resolves to an array of price entries with store names.
 */
export const fetchProductPriceHistoryByProductId = async (productId: string): Promise<Array<FullPriceEntry & { store_name: string | null }>> => {
  console.log(`fetchProductPriceHistoryByProductId called for productId: ${productId}`);
  try {
    const { data, error } = await supabase
      .from("product_price")
      .select(`
        id,
        created_at,
        price,
        currency,
        product_id,
        store_id,
        store: store( name, location ) 
      `)
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error fetching product price history:", JSON.stringify(error, null, 2));
      throw new Error(`Database query failed for product price history: ${error.message}`);
    }

    if (!data) {
      console.log("No price history data returned for productId:", productId);
      return [];
    }

    // Map the data to include store_name directly
    const priceHistory = data.map((item: any) => ({
      ...item,
      store_name: item.store?.name || null,
      // Ensure other fields from FullPriceEntry are included if needed, though product details are already known
      product_name: null, // Product details are typically already known when calling this for a specific product
      product_barcode: null,
      product_brand: null,
      store_location: item.store?.location || null,
    }));

    console.log(`Successfully fetched price history for productId ${productId}:`, priceHistory.length);
    return priceHistory;

  } catch (fetchError: any) {
    console.error("Exception caught in fetchProductPriceHistoryByProductId:", fetchError.message);
    throw new Error(fetchError.message || "An unknown error occurred while fetching product price history");
  }
}; 