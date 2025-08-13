import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js"; // our new PostgreSQL connection
import authRoutes from "./routes/auth.js";
import productsRoutes from "./routes/products.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
