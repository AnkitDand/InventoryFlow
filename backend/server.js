import express from "express";
import { Pool } from "pg";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

console.log("Starting backend...");

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Supabase
  },
});

pool
  .connect()
  .then(() => console.log("Connected to Supabase/PostgreSQL"))
  .catch((err) => console.error("DB connection error:", err));

// Make pool available to routes
app.locals.db = pool;

// Middleware
app.use(cors());
app.use(express.json());
console.log("Middleware configured: CORS and JSON parsing");

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
import authRoutes from "./routes/auth.js";
import productsRoutes from "./routes/products.js";

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
console.log("Routes configured: /api/auth, /api/products");

// Health check
app.get("/api/health", async (req, res) => {
  console.log("Health check endpoint hit");
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("DB time fetched:", result.rows[0].now);
    res.json({
      status: "ok",
      database: "connected",
      timestamp: result.rows[0].now,
    });
  } catch (error) {
    console.error("Health check error:", error.message);
    res.status(500).json({
      status: "error",
      database: "disconnected",
      error: error.message,
    });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  console.log("Root endpoint hit");
  res.json({ message: "InventoryFlow API is running!" });
});

// Start server (for local development)
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
