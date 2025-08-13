const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  price: { type: Number, required: true, min: 0 },
  imageUrl: { type: String, default: "" },
  tenantId: { type: String, required: true }, // Multi-tenant key
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index for tenant isolation
productSchema.index({ tenantId: 1 });

module.exports = mongoose.model("Product", productSchema);
