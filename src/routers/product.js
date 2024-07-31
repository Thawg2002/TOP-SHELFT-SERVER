import { Router } from "express";
import {
  create,
  deleteProductById,
  getAllProducts,
  getProductById,
  getRelatedProducts,
  updateProductById,
} from "../controllers/product";
import { checkAuth } from "../middleware/checkAuth";

const router = Router();
router.get("/products", getAllProducts);
router.get("/products/:id", getProductById);
// router.get("/products/:categoryIds/related/:productId", getRelatedProducts);
router.get("/products/:productId/related", getRelatedProducts);
router.delete("/products/:id", deleteProductById);
router.put("/products/:id", updateProductById);
router.post("/products", create);
export default router;
