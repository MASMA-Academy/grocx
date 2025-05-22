import { Request, Response } from "../deps.ts";
import { findProductByBarcode } from "../models/ProductModel.ts";

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
    return res.status(500).json({ message: errorMessage });
  }
}; 