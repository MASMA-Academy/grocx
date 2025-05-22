import { Request, Response } from "../deps.ts";
import { getAllStores } from "../models/StoreModel.ts";
import { addProductPrice, fetchAllPriceEntries } from "../models/ProductPriceModel.ts";

/**
 * Handles the request to get all stores.
 * @param req - The Express request object.
 * @param res - The Express response object.
 */
export const getStores = async (_req: Request, res: Response) => {
  try {
    console.log("getStores called");
    const stores = await getAllStores();
    
    return res.status(200).json(stores);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error
      ? error.message
      : "An unknown error occurred while fetching stores";
    console.error("Error in getStores:", errorMessage);
    return res.status(500).json({ message: errorMessage });
  }
};

/**
 * Handles the request to save a product price for a store.
 * @param req - The Express request object with product_id, store_id, price, and currency in the body.
 * @param res - The Express response object.
 */
export const saveProductPrice = async (req: Request, res: Response) => {
  try {
    console.log("saveProductPrice called with body:", req.body);
    const { product_id, store_id, price, currency = "USD" } = req.body;

    // Validate required fields
    if (!product_id || !store_id || price === undefined) {
      return res.status(400).json({ 
        message: "Missing required fields: product_id, store_id, and price are required" 
      });
    }

    // Validate price format
    if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      return res.status(400).json({ message: "Price must be a positive number" });
    }

    const priceData = {
      product_id,
      store_id,
      price: parseFloat(price),
      currency
    };

    const savedPrice = await addProductPrice(priceData);

    if (!savedPrice) {
      console.error("saveProductPrice: addProductPrice model function returned null or undefined. Database insert likely failed.");
      return res.status(500).json({
        message: "Failed to save product price. Database operation may have failed."
      });
    }
    
    return res.status(201).json({ 
      message: "Price saved successfully", 
      data: savedPrice 
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error
      ? error.message
      : "An unknown error occurred while saving product price";
    console.error("Error in saveProductPrice:", errorMessage);
    return res.status(500).json({ message: errorMessage });
  }
};

/**
 * Handles the request to get all product price entries with details.
 * @param _req - The Express request object.
 * @param res - The Express response object.
 */
export const getAllPriceEntries = async (_req: Request, res: Response) => {
  try {
    console.log("getAllPriceEntries called");
    const allEntries = await fetchAllPriceEntries();

    if (!allEntries) {
        // This case might indicate an issue in the model function if it returns null on error
        return res.status(500).json({ message: "Could not retrieve price entries" });
    }

    return res.status(200).json(allEntries);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error
      ? error.message
      : "An unknown error occurred while fetching all price entries";
    console.error("Error in getAllPriceEntries:", errorMessage);
    return res.status(500).json({ message: "Error fetching all price entries", error: errorMessage });
  }
}; 