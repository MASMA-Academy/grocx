import supabase from "../db.js";
import { Store } from "../types/index.ts";

/**
 * Fetches all stores from the database.
 * @returns A promise that resolves to an array of Store objects.
 */
export const getAllStores = async (): Promise<Store[]> => {
  console.log("getAllStores called");
  
  try {
    const { data, error } = await supabase
      .from("store")
      .select("id, created_at, name, location")
      .order("name", { ascending: true });
    
    console.log("Supabase query result for stores:", { dataCount: data?.length, error });
    
    if (error) {
      console.error("Error fetching stores:", error?.message);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log("No stores found");
      return [];
    }
    
    return data as Store[];
  } catch (fetchError) {
    console.error("Exception in getAllStores:", fetchError);
    return [];
  }
}; 