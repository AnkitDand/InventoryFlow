import express from "express";
import { Pool } from "pg";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Connect once at startup
pool
  .connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) => console.error("❌ DB connection error:", err));

app.locals.db = pool;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
import authRoutes from "./routes/auth.js";
import productsRoutes from "./routes/products.js";

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);

// Health check
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
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
  res.json({ message: "InventoryFlow API is running!" });
});

// ✅ Always listen — important for Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
