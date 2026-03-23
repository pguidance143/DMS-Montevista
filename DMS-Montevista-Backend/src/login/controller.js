const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getUserByUsername, updateDeviceId } = require("./queries");

const login = async (req, res) => {
  const { username, password, deviceId } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  try {
    const user = await getUserByUsername(username);
    console.log("User found:", user);
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    // Store device identifier if provided
    if (deviceId) {
      await updateDeviceId(user.user_id, deviceId);
    }

    const token = jwt.sign(
      {
        userId: user.user_id,
        username: user.username,
        roleId: user.role_id,
        departmentId: user.department_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    res.json({
      token,
      user: {
        userId: user.user_id,
        username: user.username,
        fullName: user.full_name,
        email: user.email,
        roleId: user.role_id,
        departmentId: user.department_id,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { login };
