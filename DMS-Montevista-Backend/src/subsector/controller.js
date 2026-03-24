const {
  getSubsectors,
  getSubsectorsCount,
  getSubsectorById,
  createSubsector,
  updateSubsector,
  deactivateSubsector,
} = require("./queries");

const listSubsectors = async (req, res) => {
  const { search = "", page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const [subsectors, total] = await Promise.all([
      getSubsectors({ search, limit: parseInt(limit), offset }),
      getSubsectorsCount(search),
    ]);

    res.json({
      data: subsectors,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error("List subsectors error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const addSubsector = async (req, res) => {
  const { subsector_name, sector_id } = req.body;

  if (!subsector_name || !subsector_name.trim()) {
    return res.status(400).json({ message: "Subsector name is required." });
  }
  if (!sector_id) {
    return res.status(400).json({ message: "Sector is required." });
  }

  try {
    const subsector = await createSubsector({
      subsector_name: subsector_name.trim(),
      sector_id,
    });
    res.status(201).json(subsector);
  } catch (error) {
    if (error.code === "23503") {
      return res.status(400).json({ message: "Invalid sector." });
    }
    console.error("Add subsector error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const editSubsector = async (req, res) => {
  const { id } = req.params;
  const { subsector_name, sector_id, status = true } = req.body;

  if (!subsector_name || !subsector_name.trim()) {
    return res.status(400).json({ message: "Subsector name is required." });
  }
  if (!sector_id) {
    return res.status(400).json({ message: "Sector is required." });
  }

  try {
    const existing = await getSubsectorById(id);
    if (!existing) return res.status(404).json({ message: "Subsector not found." });

    const subsector = await updateSubsector(id, {
      subsector_name: subsector_name.trim(),
      sector_id,
      status,
    });
    res.json(subsector);
  } catch (error) {
    if (error.code === "23503") {
      return res.status(400).json({ message: "Invalid sector." });
    }
    console.error("Edit subsector error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const removeSubsector = async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await getSubsectorById(id);
    if (!existing) return res.status(404).json({ message: "Subsector not found." });

    await deactivateSubsector(id);
    res.json({ message: "Subsector deleted successfully." });
  } catch (error) {
    console.error("Delete subsector error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { listSubsectors, addSubsector, editSubsector, removeSubsector };
