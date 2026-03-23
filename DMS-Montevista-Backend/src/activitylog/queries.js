const pool = require("../../db");

const getLogs = async ({ search = "", action_filter = "", limit = 10, offset = 0 }) => {
  const conditions = [];
  const params = [];
  let idx = 1;

  if (search) {
    conditions.push(
      `(username ILIKE $${idx} OR action ILIKE $${idx} OR entity_name ILIKE $${idx} OR details ILIKE $${idx})`
    );
    params.push(`%${search}%`);
    idx++;
  }

  if (action_filter) {
    conditions.push(`action = $${idx}`);
    params.push(action_filter);
    idx++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await pool.query(
    `SELECT log_id, user_id, username, action, entity_type, entity_id, entity_name, details, ip_address, created_at
     FROM activity_logs
     ${where}
     ORDER BY created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, limit, offset]
  );
  return result.rows;
};

const getLogsCount = async ({ search = "", action_filter = "" }) => {
  const conditions = [];
  const params = [];
  let idx = 1;

  if (search) {
    conditions.push(
      `(username ILIKE $${idx} OR action ILIKE $${idx} OR entity_name ILIKE $${idx} OR details ILIKE $${idx})`
    );
    params.push(`%${search}%`);
    idx++;
  }

  if (action_filter) {
    conditions.push(`action = $${idx}`);
    params.push(action_filter);
    idx++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await pool.query(
    `SELECT COUNT(*) FROM activity_logs ${where}`,
    params
  );
  return parseInt(result.rows[0].count);
};

const getDistinctActions = async () => {
  const result = await pool.query(
    "SELECT DISTINCT action FROM activity_logs ORDER BY action"
  );
  return result.rows.map((r) => r.action);
};

module.exports = { getLogs, getLogsCount, getDistinctActions };
