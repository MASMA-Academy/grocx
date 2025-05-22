import { express } from "../deps.ts";
import { getProductByBarcode } from "../controllers/ProductController.ts";

const router = express.Router();

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
router.get("/:barcode", getProductByBarcode);

export { router as productRouter }; 