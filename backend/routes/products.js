// routes/products.js
import express from "express";
import auth from "../middleware/auth.js";
import pool from "../db.js";
import { sendEmail } from "../utils/sendEmail.js"; // adjust path if needed
import {
  createProduct,
  getProductsByTenant,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../models/product.js";

const router = express.Router();

// Function to send low stock alert
const sendStockAlert = async (product) => {
  try {
    const { rows } = await pool.query(
      "SELECT email, company_name FROM users WHERE tenant_id = $1",
      [product.tenantId]
    );
    if (!rows.length) return;

    const tenantEmail = rows[0].email;
    const companyName = rows[0].company_name;

    await sendEmail(
      tenantEmail,
      `Low Stock Alert: ${product.name}`,
      `Hello ${companyName},\n\nThe stock for "${product.name}" is low. Only ${product.quantity} remaining. Please restock soon.\n\n- InventoryFlow`
    );

    console.log(`Alert sent to ${tenantEmail}`);
  } catch (error) {
    console.error("Error sending stock alert:", error.message);
  }
};

// Get all products for tenant
router.get("/", auth, async (req, res) => {
  try {
    const products = await getProductsByTenant(req.tenantId);
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

    if (product.quantity <= 10) {
      await sendStockAlert(product);
    }

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

    if (updated.quantity <= 10) {
      await sendStockAlert({ ...updated, tenantId: req.tenantId });
    }

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
