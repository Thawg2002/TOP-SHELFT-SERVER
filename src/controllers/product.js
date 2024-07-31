import { StatusCodes } from "http-status-codes";
import Product from "../models/product";
import Category from "../models/category";
// export const getAllProducts = async (req, res) => {
//   try {
//     const products = await Product.find();
//     if (products.length === 0) {
//       return res
//         .status(StatusCodes.NOT_FOUND)
//         .json({ message: "Không có sản phẩm nào!" });
//     }
//     return res
//       .status(StatusCodes.OK)
//       .json({ message: "Lấy toàn bộ sản phẩm thành công", products });
//   } catch (error) {
//     return res.status(400).json({ message: error.message });
//   }
// };
export const create = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    // Cập nhật các danh mục với sản phẩm mới
    if (req.body.category && req.body.category.length > 0) {
      await Category.findByIdAndUpdate(
        req.body.category,
        { $push: { products: product._id } },
        { new: true }
      );
    }

    return res
      .status(StatusCodes.CREATED)
      .json({ message: "Thêm sản phẩm thành công", product });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
};

export const getAllProducts = async (req, res) => {
  const {
    _page = 1,
    _limit = 10,
    _sort = "createdAt",
    _order = "asc",
    _expand,
  } = req.query;
  const options = {
    page: _page,
    limit: _limit,
    sort: { [_sort]: _order === "desc" ? -1 : 1 },
  };
  const populateOptions = _expand ? [{ path: "category", select: "name" }] : [];
  try {
    const result = await Product.paginate(
      { categoryId: null },
      { ...options, populate: populateOptions }
    );
    if (result.docs.length === 0) throw new Error("No products found");
    const response = {
      data: result.docs,
      pagination: {
        currentPage: result.page,
        totalPages: result.totalPages,
        totalItems: result.totalDocs,
      },
    };
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product.length === 0)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Không tìm thấy sản phẩm nào!" });
    return res
      .status(StatusCodes.OK)
      .json({ message: "Lấy sản phẩm theo id thành công", product });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
};
export const deleteProductById = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    return res
      .status(StatusCodes.OK)
      .json({ message: "Xóa sản phẩm thành công", product });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
};
export const updateProductById = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    return res
      .status(StatusCodes.OK)
      .json({ message: "Cập nhật sản phẩm thành công", product });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
};

// export const related = async (req, res) => {
//   try {
//     const product = await Product.find({
//       category: req.params.categoryId,
//       _id: { $ne: req.params.productId },
//     });
//     return res.status(StatusCodes.OK).json(product);
//   } catch (error) {}
// };

// API để lấy sản phẩm liên quan
// export const getRelatedProducts = async (req, res) => {
//   const { categoryIds, productId } = req.params;
//   // console.log("req.params", req.params);

//   try {
//     // Tìm tất cả các sản phẩm có cùng danh mục và không trùng với ID của sản phẩm hiện tại
//     const relatedProducts = await Product.find({
//       category: { $in: categoryIds.split(",") },
//       _id: { $ne: productId },
//     });

//     return res.status(StatusCodes.OK).json(relatedProducts);
//   } catch (error) {
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
//   }
// };
export const getRelatedProducts = async (req, res) => {
  const { productId } = req.params;

  try {
    // Lấy sản phẩm hiện tại
    const product = await Product.findById(productId).populate("category");
    if (!product) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Sản phẩm không tồn tại!" });
    }

    // Lấy tất cả các ID danh mục của sản phẩm hiện tại
    const categoryIds = product.category.map((cat) => cat._id);

    // Tìm các sản phẩm khác cùng danh mục
    const relatedProducts = await Product.find({
      category: { $in: categoryIds },
      _id: { $ne: productId },
    });

    return res.status(StatusCodes.OK).json(relatedProducts);
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
};

// iphone 13 product max => /product/iphone-13-product-max
// GET /product/:slug
