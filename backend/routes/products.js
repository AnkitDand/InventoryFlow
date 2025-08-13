// routes/products.js
import express from "express";
import auth from "../middleware/auth.js";
import {
  createProduct,
  getProductsByTenant,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../models/product.js";

const router = express.Router();

// Get all products for tenant
router.get("/", auth, async (req, res) => {
  try {
    const products = await getProductsByTenant(req.tenantId);
    // Sort by created_at descending
    products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create product
router.post("/", auth, async (req, res) => {
  try {
    const { name, category, quantity, price, imageUrl } = req.body;

    // Check tenant product limit (SaaS feature)
    const products = await getProductsByTenant(req.tenantId);
    if (products.length >= 50) {
      return res
        .status(400)
        .json({ message: "Product limit reached. Upgrade to premium!" });
    }

    const product = await createProduct({
      name,
      category,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      imageUrl: imageUrl || "",
      tenantId: req.tenantId,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update product
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, category, quantity, price, imageUrl } = req.body;

    // Get the product to verify tenant
    const existing = await getProductById(req.params.id);
    if (!existing || existing.tenant_id !== req.tenantId) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updated = await updateProduct(req.params.id, {
      name,
      category,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      imageUrl: imageUrl || "",
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete product
router.delete("/:id", auth, async (req, res) => {
  try {
    const existing = await getProductById(req.params.id);
    if (!existing || existing.tenant_id !== req.tenantId) {
      return res.status(404).json({ message: "Product not found" });
    }

    await deleteProduct(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
