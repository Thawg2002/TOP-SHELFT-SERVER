import { Router } from "express";
import {
    updateProductQuantity,
    addItemToCart,
    getCartByUserId,
    removeFromCart,
    increaseProductQuantity,
    decreaseProductQuantity,
} from "../controllers/cart";

const router = Router();

// lấy danh sách sản phẩm trong giỏ hàng dựa vào ID
router.get("/carts/:userId", getCartByUserId);
// Thêm sản phẩm vào giỏ hàng
// Cập nhật số lượng của sản phẩm trong giỏ hàng từ input
router.post("/carts/add-to-cart", addItemToCart);
// Cập nhật số lượng của sản phẩm trong giỏ hàng từ button
router.put("/carts/update", updateProductQuantity);
router.put("/carts/increase", increaseProductQuantity);
router.put("/carts/decrease", decreaseProductQuantity);
// Xóa item trong giỏ hàng
router.delete("/carts/remove", removeFromCart);

export default router;