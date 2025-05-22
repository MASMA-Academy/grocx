import { Request, Response } from "../deps.ts";
import { getAllStores } from "../models/StoreModel.ts";
import { addProductPrice } from "../models/ProductPriceModel.ts";

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