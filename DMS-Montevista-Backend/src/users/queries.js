const pool = require("../../db");

const getUsers = async ({ search = "", limit = 10, offset = 0 }) => {
  const result = await pool.query(
    `SELECT user_id, username, full_name, email, role_id, department_id, created_at
     FROM users
     WHERE username ILIKE $1 OR full_name ILIKE $1 OR email ILIKE $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [`%${search}%`, limit, offset]
  );
  return result.rows;
};

const getUsersCount = async (search = "") => {
  const result = await pool.query(
    `SELECT COUNT(*) FROM users
     WHERE username ILIKE $1 OR full_name ILIKE $1 OR email ILIKE $1`,
    [`%${search}%`]
  );
  return parseInt(result.rows[0].count);
};

const createUser = async ({ username, full_name, email, password_hash, role_id, department_id }) => {
  const result = await pool.query(
    `INSERT INTO users (username, full_name, email, password_hash, role_id, department_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING user_id, username, full_name, email, role_id, department_id, created_at`,
    [username, full_name, email, password_hash, role_id || null, department_id || null]
  );
  return result.rows[0];
};

const updateUser = async (userId, { username, full_name, email, role_id, department_id }) => {
  const result = await pool.query(
    `UPDATE users
     SET username = $1, full_name = $2, email = $3, role_id = $4, department_id = $5, updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $6
     RETURNING user_id, username, full_name, email, role_id, department_id, created_at`,
    [username, full_name, email, role_id || null, department_id || null, userId]
  );
  return result.rows[0];
};

const deleteUser = async (userId) => {
  await pool.query("DELETE FROM users WHERE user_id = $1", [userId]);
};

const getUserById = async (userId) => {
  const result = await pool.query(
    "SELECT user_id, username, full_name, email, role_id, department_id FROM users WHERE user_id = $1",
    [userId]
  );
  return result.rows[0];
};

module.exports = { getUsers, getUsersCount, createUser, updateUser, deleteUser, getUserById };
