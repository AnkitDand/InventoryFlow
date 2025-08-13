// product.js
import pool from "../db.js";

// Create a new product
export const createProduct = async (product) => {
  const { name, category, quantity, price, imageUrl, tenantId } = product;
  const { rows } = await pool.query(
    `INSERT INTO products (name, category, quantity, price, image_url, tenant_id)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [name, category, quantity, price, imageUrl || "", tenantId]
  );
  return rows[0];
};

// Get all products for a tenant
export const getProductsByTenant = async (tenantId) => {
  const { rows } = await pool.query(
    `SELECT * FROM products WHERE tenant_id = $1`,
    [tenantId]
  );
  return rows;
};

// Get a single product by ID
export const getProductById = async (id) => {
  const { rows } = await pool.query(`SELECT * FROM products WHERE id = $1`, [
    id,
  ]);
  return rows[0];
};

// Update a product
export const updateProduct = async (id, product) => {
  const { name, category, quantity, price, imageUrl } = product;
  const { rows } = await pool.query(
    `UPDATE products
     SET name = $1, category = $2, quantity = $3, price = $4, image_url = $5, updated_at = NOW()
     WHERE id = $6
     RETURNING *`,
    [name, category, quantity, price, imageUrl || "", id]
  );
  return rows[0];
};

// Delete a product
export const deleteProduct = async (id) => {
  const { rows } = await pool.query(
    `DELETE FROM products WHERE id = $1 RETURNING *`,
    [id]
  );
  return rows[0];
};
