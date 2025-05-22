import { express } from "../deps.ts";
import { getProductByBarcode } from "../controllers/ProductController.ts";
import { getStores, saveProductPrice } from "../controllers/StoreController.ts";

const router = express.Router();

// Add a test endpoint
router.get("/product-test", (req, res) => {
  console.log("Test endpoint called");
  return res.status(200).json({ message: "Product router is working" });
});

/**
 * @swagger
 * /api/product/{barcode}:
 *   get:
 *     summary: Get product by barcode
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: barcode
 *         schema:
 *           type: string
 *         required: true
 *         description: The product barcode
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product' # Assuming you have a Product schema defined for swagger
 *       400:
 *         description: Barcode parameter is required
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.get("/product/:barcode", getProductByBarcode);

/**
 * @swagger
 * /stores:
 *   get:
 *     summary: Get all stores
 *     tags: [Store]
 *     responses:
 *       200:
 *         description: List of stores
 *       500:
 *         description: Internal server error
 */
router.get("/stores", getStores);

/**
 * @swagger
 * /product-price:
 *   post:
 *     summary: Save product price for a store
 *     tags: [ProductPrice]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - store_id
 *               - price
 *             properties:
 *               product_id:
 *                 type: string
 *               store_id:
 *                 type: string
 *               price:
 *                 type: number
 *               currency:
 *                 type: string
 *     responses:
 *       201:
 *         description: Price saved successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Internal server error
 */
router.post("/product-price", saveProductPrice);

export { router as productRouter }; 