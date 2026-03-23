const { getRoles, getRolesCount, getAllPages, getRoleById, createRole, updateRole, deleteRole, setRolePages } = require("./queries");
const { log } = require("../utils/logger");

const listRoles = async (req, res) => {
  const { search = "", page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const [roles, total] = await Promise.all([
      getRoles({ search, limit: parseInt(limit), offset }),
      getRolesCount(search),
    ]);

    res.json({
      data: roles,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error("List roles error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const listPages = async (req, res) => {
  try {
    const pages = await getAllPages();
    res.json(pages);
  } catch (error) {
    console.error("List pages error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const addRole = async (req, res) => {
  const { role_name, description, is_active, page_ids } = req.body;

  if (!role_name) {
    return res.status(400).json({ message: "Role name is required." });
  }

  try {
    const role = await createRole({ role_name, description, is_active });
    await setRolePages(role.role_id, page_ids || []);
    const full = await getRoleById(role.role_id);
    await log({
      action: "CREATE_ROLE", entity_type: "role",
      entity_id: role.role_id, entity_name: role.role_name,
      details: `Created role "${role.role_name}"`, ip_address: req.ip,
    });
    res.status(201).json(full);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Role name already exists." });
    }
    console.error("Add role error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const editRole = async (req, res) => {
  const { id } = req.params;
  const { role_name, description, is_active, page_ids } = req.body;

  if (!role_name) {
    return res.status(400).json({ message: "Role name is required." });
  }

  try {
    const existing = await getRoleById(id);
    if (!existing) return res.status(404).json({ message: "Role not found." });

    await updateRole(id, { role_name, description, is_active });
    await setRolePages(id, page_ids || []);
    const full = await getRoleById(id);
    await log({
      action: "UPDATE_ROLE", entity_type: "role",
      entity_id: parseInt(id), entity_name: role_name,
      details: `Updated role "${role_name}"`, ip_address: req.ip,
    });
    res.json(full);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Role name already exists." });
    }
    console.error("Edit role error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const removeRole = async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await getRoleById(id);
    if (!existing) return res.status(404).json({ message: "Role not found." });

    await deleteRole(id);
    await log({
      action: "DELETE_ROLE", entity_type: "role",
      entity_id: parseInt(id), entity_name: existing.role_name,
      details: `Deleted role "${existing.role_name}"`, ip_address: req.ip,
    });
    res.json({ message: "Role deleted successfully." });
  } catch (error) {
    console.error("Delete role error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { listRoles, listPages, addRole, editRole, removeRole };
