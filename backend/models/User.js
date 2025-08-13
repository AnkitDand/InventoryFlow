// user.js
import pool from "../db.js";

// Create a new user
export const createUser = async (user) => {
  const { email, password, companyName, tenantId, plan } = user;
  const { rows } = await pool.query(
    `INSERT INTO users (email, password, company_name, tenant_id, plan)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [email, password, companyName, tenantId, plan || "free"]
  );
  return rows[0];
};

// Get user by email
export const getUserByEmail = async (email) => {
  const { rows } = await pool.query(`SELECT * FROM users WHERE email = $1`, [
    email,
  ]);
  return rows[0];
};

// Get user by tenantId
export const getUserByTenantId = async (tenantId) => {
  const { rows } = await pool.query(
    `SELECT * FROM users WHERE tenant_id = $1`,
    [tenantId]
  );
  return rows[0];
};

// Update user's plan
export const updateUserPlan = async (tenantId, plan) => {
  const { rows } = await pool.query(
    `UPDATE users
     SET plan = $1
     WHERE tenant_id = $2
     RETURNING *`,
    [plan, tenantId]
  );
  return rows[0];
};
