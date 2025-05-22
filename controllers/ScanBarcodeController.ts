import { Request, Response } from "../deps.ts";
import {
  addProductToDatabase,
  findProductByBarcode,
  deleteProductFromDatabase
} from "../models/productModel.ts";

export const scanBarcode = async (req: Request, res: Response) => {
  try {
    //POST (body)
    const barcode = req.body.barcode;
    // console.log("BODY:", req.body);
    if (!barcode) {
      return res.status(400).json({
        message: "Barcode is required  " + req.body.barcode,
      });
    }
    const product = await findProductByBarcode(barcode);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.json(product);
  } catch (error) {
    console.error("Error scanning barcode:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const addProduct = async (req: Request, res: Response) => {
  try {
    const { barcode, name, brand, description, category } = req.body;
    console.log("BODY:", req.body);
    if (!barcode || !name || !brand || !description || !category) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }
    // Add product to the database
    const product = await addProductToDatabase({
      barcode,
      name,
      brand,
      description,
      category,
    });
    if (!product) {
      return res.status(500).json({ message: "Error adding product: "});
    }
    return res.json({ message: "Product added successfully" });
  } catch (error) {
    console.error("Error adding product:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { barcode } = req.body;
    if (!barcode) {
      return res.status(400).json({
        message: "Barcode is required",
      });
    }
    // Delete product from the database
    const success = await deleteProductFromDatabase(barcode);
    if (!success) {
      return res.status(500).json({ message: "Error deleting product" });
    }
    return res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
