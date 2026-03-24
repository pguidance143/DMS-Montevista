const pool = require("../../db");

/**
 * Record an activity log entry.
 * Never throws — logging must not break the main request flow.
 */
const log = async ({
  user_id,
  username,
  action,
  entity_type = null,
  entity_id   = null,
  entity_name = null,
  details     = null,
  ip_address  = null,
}) => {
  try {
    await pool.query(
      `INSERT INTO activity_logs
         (user_id, username, action, entity_type, entity_id, entity_name, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [user_id || null, username || null, action, entity_type, entity_id, entity_name, details, ip_address]
    );
  } catch (err) {
    console.error("Activity log write error:", err.message);
  }
};

module.exports = { log };
