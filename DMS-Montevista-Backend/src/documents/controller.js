const {
  getDocuments,
  getDocumentsCount,
  getDocumentById,
  createDocument,
  updateDocument,
  archiveDocument,
  setMembersPresent,
  setCommittees,
  getDocumentTypes,
  getSeriesYears,
} = require("./queries");
const { log } = require("../utils/logger");

// ── List documents ──────────────────────────────────────────
const listDocuments = async (req, res) => {
  const { search = "", page = 1, limit = 10, document_type_id, sector_id, series_year, status } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const filters = { search, document_type_id, sector_id, series_year, status: status || "active" };
    const [documents, total] = await Promise.all([
      getDocuments({ ...filters, limit: parseInt(limit), offset }),
      getDocumentsCount(filters),
    ]);

    res.json({
      data: documents,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error("List documents error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// ── Get single document ─────────────────────────────────────
const getDocument = async (req, res) => {
  try {
    const doc = await getDocumentById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found." });
    res.json(doc);
  } catch (error) {
    console.error("Get document error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// ── Add document ────────────────────────────────────────────
const addDocument = async (req, res) => {
  const { document_type_id, document_number, series_year, title } = req.body;

  if (!document_type_id || !document_number || !series_year || !title) {
    return res.status(400).json({ message: "Document type, number, series year, and title are required." });
  }

  try {
    const fileData = {};
    if (req.file) {
      fileData.file_name = req.file.originalname;
      fileData.file_path = req.file.path;
      fileData.file_type = req.file.mimetype;
      fileData.file_size = req.file.size;
    }

    const doc = await createDocument({ ...req.body, ...fileData });

    // Save members present if provided
    if (req.body.members_present) {
      const members = JSON.parse(req.body.members_present);
      if (members.length) await setMembersPresent(doc.document_id, members);
    }

    // Save committees if provided
    if (req.body.committees) {
      const committees = JSON.parse(req.body.committees);
      if (committees.length) await setCommittees(doc.document_id, committees);
    }

    log({
      user_id: req.body.uploaded_by,
      action: "CREATE_DOCUMENT",
      entity_type: "document",
      entity_id: doc.document_id,
      entity_name: `${doc.document_number} Series ${doc.series_year} - ${doc.title}`,
    });

    const full = await getDocumentById(doc.document_id);
    res.status(201).json(full);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "A document with this number and series year already exists for this type." });
    }
    console.error("Add document error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// ── Edit document ───────────────────────────────────────────
const editDocument = async (req, res) => {
  const { id } = req.params;
  const { document_type_id, document_number, series_year, title } = req.body;

  if (!document_type_id || !document_number || !series_year || !title) {
    return res.status(400).json({ message: "Document type, number, series year, and title are required." });
  }

  try {
    const existing = await getDocumentById(id);
    if (!existing) return res.status(404).json({ message: "Document not found." });

    const fileData = {};
    if (req.file) {
      fileData.file_name = req.file.originalname;
      fileData.file_path = req.file.path;
      fileData.file_type = req.file.mimetype;
      fileData.file_size = req.file.size;
    }

    await updateDocument(id, { ...req.body, ...fileData });

    // Update members present if provided
    if (req.body.members_present) {
      const members = JSON.parse(req.body.members_present);
      await setMembersPresent(id, members);
    }

    // Update committees if provided
    if (req.body.committees) {
      const committees = JSON.parse(req.body.committees);
      await setCommittees(id, committees);
    }

    log({
      user_id: req.body.uploaded_by,
      action: "UPDATE_DOCUMENT",
      entity_type: "document",
      entity_id: parseInt(id),
      entity_name: `${document_number} Series ${series_year} - ${title}`,
    });

    const full = await getDocumentById(id);
    res.json(full);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "A document with this number and series year already exists for this type." });
    }
    console.error("Edit document error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// ── Delete (archive) document ───────────────────────────────
const removeDocument = async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await getDocumentById(id);
    if (!existing) return res.status(404).json({ message: "Document not found." });

    await archiveDocument(id);

    log({
      action: "DELETE_DOCUMENT",
      entity_type: "document",
      entity_id: parseInt(id),
      entity_name: `${existing.document_number} Series ${existing.series_year} - ${existing.title}`,
    });

    res.json({ message: "Document archived successfully." });
  } catch (error) {
    console.error("Delete document error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// ── List document types ─────────────────────────────────────
const listDocumentTypes = async (req, res) => {
  try {
    const types = await getDocumentTypes();
    res.json(types);
  } catch (error) {
    console.error("List document types error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// ── List series years ───────────────────────────────────────
const listSeriesYears = async (req, res) => {
  try {
    const years = await getSeriesYears();
    res.json(years);
  } catch (error) {
    console.error("List series years error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  listDocuments,
  getDocument,
  addDocument,
  editDocument,
  removeDocument,
  listDocumentTypes,
  listSeriesYears,
};
