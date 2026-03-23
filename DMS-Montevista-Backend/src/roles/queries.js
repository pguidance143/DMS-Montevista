const pool = require("../../db");

const getRoles = async ({ search = "", limit = 10, offset = 0 }) => {
  const result = await pool.query(
    `SELECT r.role_id, r.role_name, r.description, r.is_active, r.created_at,
            COALESCE(json_agg(p.page_id) FILTER (WHERE p.page_id IS NOT NULL), '[]') AS page_ids
     FROM roles r
     LEFT JOIN role_pages rp ON rp.role_id = r.role_id
     LEFT JOIN pages p ON p.page_id = rp.page_id
     WHERE r.role_name ILIKE $1 OR r.description ILIKE $1
     GROUP BY r.role_id
     ORDER BY r.created_at DESC
     LIMIT $2 OFFSET $3`,
    [`%${search}%`, limit, offset]
  );
  return result.rows;
};

const getRolesCount = async (search = "") => {
  const result = await pool.query(
    `SELECT COUNT(*) FROM roles
     WHERE role_name ILIKE $1 OR description ILIKE $1`,
    [`%${search}%`]
  );
  return parseInt(result.rows[0].count);
};

const getAllPages = async () => {
  const result = await pool.query(
    "SELECT page_id, page_name, description FROM pages ORDER BY page_name"
  );
  return result.rows;
};

const getRoleById = async (roleId) => {
  const result = await pool.query(
    `SELECT r.role_id, r.role_name, r.description, r.is_active,
            COALESCE(json_agg(rp.page_id) FILTER (WHERE rp.page_id IS NOT NULL), '[]') AS page_ids
     FROM roles r
     LEFT JOIN role_pages rp ON rp.role_id = r.role_id
     WHERE r.role_id = $1
     GROUP BY r.role_id`,
    [roleId]
  );
  return result.rows[0];
};

const createRole = async ({ role_name, description, is_active }) => {
  const result = await pool.query(
    `INSERT INTO roles (role_name, description, is_active)
     VALUES ($1, $2, $3)
     RETURNING role_id, role_name, description, is_active, created_at`,
    [role_name, description || null, is_active !== false]
  );
  return result.rows[0];
};

const updateRole = async (roleId, { role_name, description, is_active }) => {
  const result = await pool.query(
    `UPDATE roles
     SET role_name = $1, description = $2, is_active = $3, updated_at = CURRENT_TIMESTAMP
     WHERE role_id = $4
     RETURNING role_id, role_name, description, is_active, created_at`,
    [role_name, description || null, is_active !== false, roleId]
  );
  return result.rows[0];
};

const deleteRole = async (roleId) => {
  await pool.query("DELETE FROM roles WHERE role_id = $1", [roleId]);
};

const setRolePages = async (roleId, pageIds) => {
  await pool.query("DELETE FROM role_pages WHERE role_id = $1", [roleId]);
  if (pageIds && pageIds.length > 0) {
    const values = pageIds.map((pid, i) => `($1, $${i + 2})`).join(", ");
    await pool.query(
      `INSERT INTO role_pages (role_id, page_id) VALUES ${values} ON CONFLICT DO NOTHING`,
      [roleId, ...pageIds]
    );
  }
};

module.exports = { getRoles, getRolesCount, getAllPages, getRoleById, createRole, updateRole, deleteRole, setRolePages };
