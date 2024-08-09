import { StatusCodes } from "http-status-codes";
import Cart from "../models/cart";
import Product from "../models/product";
const findProductInCart = (cart, productId) => {
  return cart.products.find((item) => item.productId.toString() === productId);
};
// Lấy danh sách sản phẩm thuộc 1 user
export const getCartByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const cart = await Cart.findOne({ userId }).populate("products.productId");
    const cartData = {
      products: cart.products.map((item) => ({
        productId: item.productId._id,
        name: item.productId.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        finalPrice: item.finalPrice,
      })),
    };
    // console.log("cart", cart);

    // console.log("cartData", cartData);

    return res.status(StatusCodes.OK).json({
      message: "Tổng số sản phẩm trong giỏ hàng",
      cart: {
        cartData: cartData,
        finalTotalPrice: cart.finalTotalPrice,
        totalQuantity: cart.totalQuantity,
        totalDiscount: cart.totalDiscount,
      },
    });
  } catch (error) {}
};
// Thêm sản phẩm vào giỏ hàng
export const addItemToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    // console.log("req.body", req.body);

    // Kiểm tra xem các trường bắt buộc đã có giá trị hay chưa
    if (!userId || !productId || !quantity) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Missing required fields" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, products: [] });
    } //check tồn tại

    const check = await cart.products.findIndex(
      (product) => product.productId.toString() == productId
    );
    console.log(check);

    // Tìm sản phẩm theo id
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Product not found" });
    }
    // console.log("product", product);

    const { regular_price, discount, image } = product;
    const price = regular_price - regular_price * (discount / 100);
    const finalPrice = price * quantity;
    // console.log("regular_price", regular_price);
    // console.log("discount", discount);
    // console.log("finalPrice", finalPrice);
    if (check !== -1) {
      // Sản phẩm đã có trong giỏ hàng
      const existingProduct = cart.products[check];
      // Cập nhật số lượng nếu không vượt quá 10
      if (existingProduct.quantity + quantity <= 10) {
        existingProduct.quantity += quantity;
        existingProduct.price = price;
        existingProduct.finalPrice = price * existingProduct.quantity;
        existingProduct.discount = discount;
      } else {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: "Quantity exceeds limit of 10" });
      }
    } else {
      console.log("chưa có cart sẽ chạy vào đây");
      // cart.products.push({ productId, quantity, price, finalPrice, discount });
      cart.products.push({
        productId,
        quantity,
        finalPrice: finalPrice,
        discount,
        image,
        price,
      });
    }
    cart.totalQuantity = cart.products.reduce(
      (acc, item) => acc + item.quantity,
      0
    );
    cart.totalPrice = cart.products.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    cart.totalDiscount = cart.products.reduce(
      (acc, item) => acc + item.price * item.quantity * (item.discount / 100),
      0
    );
    cart.finalTotalPrice = cart.totalPrice - cart.totalDiscount;
    await cart.save();
    res.status(StatusCodes.CREATED).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Xóa sản phẩm trong giỏ hàng thuộc 1 user

export const removeFromCart = async (req, res) => {
  const { userId, productIds } = req.body;
  console.log("productIds", productIds);
  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Cart not found" });
    }
    // cart.products = cart.products.filter(
    //   (product) =>
    //     product.productId && product.productId.toString() !== productId
    // );
    // Lọc sản phẩm không nằm trong mảng productIds
    cart.products = cart.products.filter(
      (product) => !productIds.includes(product.productId.toString())
    );
    await cart.save();
    return res.status(StatusCodes.OK).json({ cart });
  } catch (error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Internal Server Error" });
  }
};
// Cập nhật số lượng sản phẩm trong giỏ hàng thuộc 1 user
export const updateProductQuantity = async (req, res) => {
  const { userId, productId, quantity } = req.body;
  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Cart not found" });
    }

    const product = findProductInCart(cart, productId);
    if (!product) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Product not found" });
    }
    product.quantity = quantity;

    // Tự động cập nhật tổng số lượng và giá
    await cart.save();
    return res.status(StatusCodes.OK).json({ cart });
  } catch (error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Internal Server Error" });
  }
};

// Tăng số lượng của sản phẩm trong giỏ hàng
export const increaseProductQuantity = async (req, res) => {
  const { userId, productId } = req.body;
  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const product = cart.products.find(
      (item) => item.productId.toString() === productId
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    product.quantity++;
    product.finalPrice = product.price * product.quantity;

    // Tính toán lại tổng số lượng, tổng giá, tổng chiết khấu và tổng giá cuối cùng
    cart.totalQuantity = cart.products.reduce(
      (acc, item) => acc + item.quantity,
      0
    );
    cart.totalPrice = cart.products.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    cart.totalDiscount = cart.products.reduce(
      (acc, item) => acc + item.price * item.quantity * (item.discount / 100),
      0
    );
    cart.finalTotalPrice = cart.totalPrice - cart.totalDiscount;

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Giảm số lượng của sản phẩm trong giỏ hàng
export const decreaseProductQuantity = async (req, res) => {
  const { userId, productId } = req.body;
  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const product = cart.products.find(
      (item) => item.productId.toString() === productId
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    if (product.quantity > 1) {
      product.quantity--;
    }

    product.finalPrice = product.price * product.quantity;

    cart.totalQuantity = cart.products.reduce(
      (acc, item) => acc + item.quantity,
      0
    );
    cart.totalPrice = cart.products.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    cart.totalDiscount = cart.products.reduce(
      (acc, item) => acc + item.price * item.quantity * (item.discount / 100),
      0
    );
    cart.finalTotalPrice = cart.totalPrice - cart.totalDiscount;

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
