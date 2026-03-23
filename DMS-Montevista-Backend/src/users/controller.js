const bcrypt = require("bcryptjs");
const { getUsers, getUsersCount, createUser, updateUser, deleteUser, getUserById } = require("./queries");

const listUsers = async (req, res) => {
  const { search = "", page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const [users, total] = await Promise.all([
      getUsers({ search, limit: parseInt(limit), offset }),
      getUsersCount(search),
    ]);

    res.json({
      data: users,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error("List users error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const addUser = async (req, res) => {
  const { username, full_name, email, password, role_id, department_id } = req.body;

  if (!username || !full_name || !email || !password) {
    return res.status(400).json({ message: "Full name, username, email, and password are required." });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);
    const user = await createUser({ username, full_name, email, password_hash, role_id, department_id });
    res.status(201).json(user);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Username or email already exists." });
    }
    console.error("Add user error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const editUser = async (req, res) => {
  const { id } = req.params;
  const { username, full_name, email, role_id, department_id } = req.body;

  if (!username || !full_name || !email) {
    return res.status(400).json({ message: "Full name, username, and email are required." });
  }

  try {
    const existing = await getUserById(id);
    if (!existing) return res.status(404).json({ message: "User not found." });

    const user = await updateUser(id, { username, full_name, email, role_id, department_id });
    res.json(user);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Username or email already exists." });
    }
    console.error("Edit user error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const removeUser = async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await getUserById(id);
    if (!existing) return res.status(404).json({ message: "User not found." });

    await deleteUser(id);
    res.json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { listUsers, addUser, editUser, removeUser };
