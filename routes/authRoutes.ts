import { express } from "../deps.ts";
import * as AuthController from "../controllers/AuthController.ts";

const router = express.Router();

// router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

export { router as authRouter };