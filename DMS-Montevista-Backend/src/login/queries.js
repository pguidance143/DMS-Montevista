const pool = require("../../db");

const getUserByUsername = async (username) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE username = $1",
    [username]
  );
  return result.rows[0];
};

const updateDeviceId = async (userId, deviceId) => {
  await pool.query(
    "UPDATE users SET device_id = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2",
    [deviceId, userId]
  );
};

module.exports = { getUserByUsername, updateDeviceId };
