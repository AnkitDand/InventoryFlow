import serverless from "serverless-http";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "../db.js"; // adjust path if needed
import authRoutes from "../routes/auth.js";
import productsRoutes from "../routes/products.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test DB connection
pool
  .connect()
  .then(() => console.log("Connected to Supabase/PostgreSQL"))
  .catch((err) => console.error("DB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Export handler for Vercel serverless function
export default app;
export const handler = serverless(app);
