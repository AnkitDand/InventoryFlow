const express = require("express");
const Product = require("../models/Product");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all products for tenant
router.get("/", auth, async (req, res) => {
  try {
    // CRITICAL: Only return products for this tenant
    const products = await Product.find({ tenantId: req.tenantId }).sort({
      createdAt: -1,
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create product
router.post("/", auth, async (req, res) => {
  try {
    const { name, category, quantity, price, imageUrl } = req.body;

    // Check tenant product limit (SaaS feature)
    const productCount = await Product.countDocuments({
      tenantId: req.tenantId,
    });
    if (productCount >= 50) {
      // Free tier limit
      return res
        .status(400)
        .json({ message: "Product limit reached. Upgrade to premium!" });
    }

    const product = new Product({
      name,
      category,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      imageUrl: imageUrl || "",
      tenantId: req.tenantId, // Ensure tenant isolation
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update product
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, category, quantity, price, imageUrl } = req.body;

    // CRITICAL: Only update if belongs to tenant
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { name, category, quantity, price, imageUrl, updatedAt: new Date() },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete product
router.delete("/:id", auth, async (req, res) => {
  try {
    // CRITICAL: Only delete if belongs to tenant
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.tenantId,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
