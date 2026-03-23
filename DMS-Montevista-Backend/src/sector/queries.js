const pool = require("../../db");

const getSectors = async ({ search = "", limit = 10, offset = 0 }) => {
  const result = await pool.query(
    `SELECT id, sector_name, status
     FROM sector
     WHERE sector_name ILIKE $1 AND status = true
     ORDER BY id DESC
     LIMIT $2 OFFSET $3`,
    [`%${search}%`, limit, offset]
  );
  return result.rows;
};

const getSectorsCount = async (search = "") => {
  const result = await pool.query(
    `SELECT COUNT(*) FROM sector WHERE sector_name ILIKE $1 AND status = true`,
    [`%${search}%`]
  );
  return parseInt(result.rows[0].count);
};

const getSectorById = async (id) => {
  const result = await pool.query(
    "SELECT id, sector_name, status FROM sector WHERE id = $1",
    [id]
  );
  return result.rows[0];
};

const createSector = async ({ sector_name }) => {
  const result = await pool.query(
    `INSERT INTO sector (sector_name)
     VALUES ($1)
     RETURNING id, sector_name, status`,
    [sector_name]
  );
  return result.rows[0];
};

const updateSector = async (id, { sector_name, status }) => {
  const result = await pool.query(
    `UPDATE sector
     SET sector_name = $1, status = $2
     WHERE id = $3
     RETURNING id, sector_name, status`,
    [sector_name, status, id]
  );
  return result.rows[0];
};

const deactivateSector = async (id) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("UPDATE subsector SET status = false WHERE sector_id = $1", [id]);
    await client.query("UPDATE sector    SET status = false WHERE id = $1",        [id]);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { getSectors, getSectorsCount, getSectorById, createSector, updateSector, deactivateSector };
