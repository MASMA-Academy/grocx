import { Request, Response } from "../deps.ts";
import { findProductByBarcode, findProductsByQuery } from "../models/ProductModel.ts";
import { fetchProductPriceHistoryByProductId } from "../models/ProductPriceModel.ts";

/**
 * Handles the request to get a product by its barcode.
 * @param req - The Express request object. Expects barcode as a URL parameter.
 * @param res - The Express response object.
 */
export const getProductByBarcode = async (req: Request, res: Response) => {
  try {
    console.log("getProductByBarcode called with params:", req.params);
    const { barcode } = req.params; // Get barcode from URL parameters

    if (!barcode) {
      console.log("No barcode provided in request");
      return res.status(400).json({ message: "Barcode parameter is required" });
    }

    console.log("Fetching product with barcode:", barcode);
    const product = await findProductByBarcode(barcode);

    if (!product) {
      console.log("No product found with barcode:", barcode);
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("Product found:", product);
    return res.status(200).json(product);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error
      ? error.message
      : "An unknown error occurred while fetching the product";
    console.error("Error in getProductByBarcode:", errorMessage);
    return res.status(500).json({ message: "Error fetching product", error: errorMessage });
  }
};

/**
 * Handles the request to search for products.
 * @param req - The Express request object. Expects search query 'q' as a URL query parameter.
 * @param res - The Express response object.
 */
export const searchProducts = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    console.log("searchProducts called with query:", query);

    if (!query) {
      return res.status(400).json({ message: "Search query (q) is required" });
    }

    const products = await findProductsByQuery(query);

    // It's fine to return an empty array if no products are found
    return res.status(200).json(products || []); 

  } catch (error: unknown) {
    const errorMessage = error instanceof Error
      ? error.message
      : "An unknown error occurred while searching products";
    console.error("Error in searchProducts:", errorMessage);
    return res.status(500).json({ message: "Error searching products", error: errorMessage });
  }
};

/**
 * Handles the request to get the price history for a specific product.
 * @param req - The Express request object. Expects productId as a URL parameter.
 * @param res - The Express response object.
 */
export const getProductPriceHistory = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    console.log("getProductPriceHistory called for productId:", productId);

    if (!productId) {
      return res.status(400).json({ message: "Product ID parameter is required" });
    }

    const history = await fetchProductPriceHistoryByProductId(productId);

    return res.status(200).json(history || []);

  } catch (error: unknown) {
    const errorMessage = error instanceof Error
      ? error.message
      : "An unknown error occurred while fetching product price history";
    console.error("Error in getProductPriceHistory:", errorMessage);
    return res.status(500).json({ message: "Error fetching product price history", error: errorMessage });
  }
};

// Placeholder for createProduct if you implement it for the POST /product route
// export const createProduct = async (req: Request, res: Response) => { ... }; 