import { express } from "../deps.ts";
import * as ScanBarcodeController from "../controllers/ScanBarcodeController.ts";

const router = express.Router();

// Accept barcode via GET (query param) or POST (body)
// router.get("/scan-barcode", ScanBarcodeController.scanBarcode);
router.post("/scan-barcode-product", ScanBarcodeController.scanBarcode);

router.post("/add-product", ScanBarcodeController.addProduct);
router.delete("/delete-product", ScanBarcodeController.deleteProduct);

export { router as scanBarcodeRouter };
