const pool = require("../../db");

const getSubsectors = async ({ search = "", limit = 10, offset = 0 }) => {
  const result = await pool.query(
    `SELECT ss.id, ss.subsector_name, ss.sector_id, ss.status, s.sector_name
     FROM subsector ss
     LEFT JOIN sector s ON s.id = ss.sector_id
     WHERE (ss.subsector_name ILIKE $1 OR s.sector_name ILIKE $1) AND ss.status = true
     ORDER BY ss.id DESC
     LIMIT $2 OFFSET $3`,
    [`%${search}%`, limit, offset]
  );
  return result.rows;
};

const getSubsectorsCount = async (search = "") => {
  const result = await pool.query(
    `SELECT COUNT(*)
     FROM subsector ss
     LEFT JOIN sector s ON s.id = ss.sector_id
     WHERE (ss.subsector_name ILIKE $1 OR s.sector_name ILIKE $1) AND ss.status = true`,
    [`%${search}%`]
  );
  return parseInt(result.rows[0].count);
};

const getSubsectorById = async (id) => {
  const result = await pool.query(
    `SELECT ss.id, ss.subsector_name, ss.sector_id, ss.status, s.sector_name
     FROM subsector ss
     LEFT JOIN sector s ON s.id = ss.sector_id
     WHERE ss.id = $1`,
    [id]
  );
  return result.rows[0];
};

const createSubsector = async ({ subsector_name, sector_id }) => {
  const result = await pool.query(
    `INSERT INTO subsector (subsector_name, sector_id)
     VALUES ($1, $2)
     RETURNING id, subsector_name, sector_id, status`,
    [subsector_name, sector_id]
  );
  return result.rows[0];
};

const updateSubsector = async (id, { subsector_name, sector_id, status }) => {
  const result = await pool.query(
    `UPDATE subsector
     SET subsector_name = $1, sector_id = $2, status = $3
     WHERE id = $4
     RETURNING id, subsector_name, sector_id, status`,
    [subsector_name, sector_id, status, id]
  );
  return result.rows[0];
};

const deactivateSubsector = async (id) => {
  await pool.query("UPDATE subsector SET status = false WHERE id = $1", [id]);
};

module.exports = {
  getSubsectors,
  getSubsectorsCount,
  getSubsectorById,
  createSubsector,
  updateSubsector,
  deactivateSubsector,
};
