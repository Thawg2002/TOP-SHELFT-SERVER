import mongoose, { Schema } from "mongoose";
import slugify from "slugify";
const categorySchema = new Schema(
  {
    name: {
      type: String,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    // products: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Product",
    //   },
    // ],
  },
  { timestamps: true, versionKey: false }
);
// Middleware để tự động tạo slug từ name trước khi lưu
categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});
export default mongoose.model("Category", categorySchema);
