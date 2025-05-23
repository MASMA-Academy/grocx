import { express } from "../deps.ts";
import { getProductByBarcode, searchProducts, getProductPriceHistory } from "../controllers/ProductController.ts";
import { getStores, saveProductPrice, getAllPriceEntries } from "../controllers/StoreController.ts";

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
 * /products/search:
 *   get:
 *     summary: Search for products by name or barcode
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: The search query (product name or barcode)
 *     responses:
 *       200:
 *         description: A list of matching products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       400:
 *         description: Search query is required
 *       500:
 *         description: Internal server error
 */
router.get("/products/search", searchProducts);

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

/**
 * @swagger
 * /product-prices/all:
 *   get:
 *     summary: Get all recorded product prices with product and store details
 *     tags: [ProductPrice]
 *     responses:
 *       200:
 *         description: A list of all price entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object # Define the expected shape of each item here
 *                 # Example item: { product_name, product_barcode, product_brand, store_name, store_location, price, currency, created_at }
 *       500:
 *         description: Internal server error
 */
router.get("/product-prices/all", getAllPriceEntries);

/**
 * @swagger
 * /product/{productId}/price-history:
 *   get:
 *     summary: Get price history for a specific product
 *     tags: [ProductPrice]
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the product
 *     responses:
 *       200:
 *         description: A list of price entries for the product, including store details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FullPriceEntry' 
 *       400:
 *         description: Product ID parameter is required
 *       500:
 *         description: Internal server error
 */
router.get("/product/:productId/price-history", getProductPriceHistory);
router.get("/product-prices/history/:productId", getProductPriceHistory);
export { router as productRouter }; 