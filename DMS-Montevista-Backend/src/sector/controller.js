const {
  getSectors,
  getSectorsCount,
  getSectorById,
  createSector,
  updateSector,
  deactivateSector,
} = require("./queries");

const listSectors = async (req, res) => {
  const { search = "", page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const [sectors, total] = await Promise.all([
      getSectors({ search, limit: parseInt(limit), offset }),
      getSectorsCount(search),
    ]);

    res.json({
      data: sectors,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error("List sectors error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const addSector = async (req, res) => {
  const { sector_name } = req.body;

  if (!sector_name || !sector_name.trim()) {
    return res.status(400).json({ message: "Sector name is required." });
  }

  try {
    const sector = await createSector({ sector_name: sector_name.trim() });
    res.status(201).json(sector);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "A sector with this name already exists." });
    }
    console.error("Add sector error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const editSector = async (req, res) => {
  const { id } = req.params;
  const { sector_name, status = true } = req.body;

  if (!sector_name || !sector_name.trim()) {
    return res.status(400).json({ message: "Sector name is required." });
  }

  try {
    const existing = await getSectorById(id);
    if (!existing) return res.status(404).json({ message: "Sector not found." });

    const sector = await updateSector(id, { sector_name: sector_name.trim(), status });
    res.json(sector);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "A sector with this name already exists." });
    }
    console.error("Edit sector error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const removeSector = async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await getSectorById(id);
    if (!existing) return res.status(404).json({ message: "Sector not found." });

    await deactivateSector(id);
    res.json({ message: "Sector deleted successfully." });
  } catch (error) {
    console.error("Delete sector error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { listSectors, addSector, editSector, removeSector };
