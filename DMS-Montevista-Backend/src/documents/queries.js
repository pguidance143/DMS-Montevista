const pool = require("../../db");

// ── List documents (paginated, searchable, filterable) ──────
const getDocuments = async ({ search = "", limit = 10, offset = 0, document_type_id, sector_id, series_year, status = "active" }) => {
  const conditions = ["d.status = $1"];
  const params = [status];
  let idx = 2;

  if (search) {
    conditions.push(`(d.title ILIKE $${idx} OR d.document_number ILIKE $${idx} OR d.content_text ILIKE $${idx} OR d.author ILIKE $${idx})`);
    params.push(`%${search}%`);
    idx++;
  }
  if (document_type_id) {
    conditions.push(`d.document_type_id = $${idx}`);
    params.push(parseInt(document_type_id));
    idx++;
  }
  if (sector_id) {
    conditions.push(`d.sector_id = $${idx}`);
    params.push(parseInt(sector_id));
    idx++;
  }
  if (series_year) {
    conditions.push(`d.series_year = $${idx}`);
    params.push(parseInt(series_year));
    idx++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await pool.query(
    `SELECT d.*, dt.type_name,
            s.sector_name, sub.subsector_name,
            u.full_name AS uploaded_by_name,
            (SELECT COUNT(*) FROM document_files df WHERE df.document_id = d.document_id) AS file_count
     FROM documents d
     LEFT JOIN document_types dt ON dt.id = d.document_type_id
     LEFT JOIN sector s ON s.id = d.sector_id
     LEFT JOIN subsector sub ON sub.id = d.subsector_id
     LEFT JOIN users u ON u.user_id = d.uploaded_by
     ${where}
     ORDER BY d.created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, limit, offset]
  );
  return result.rows;
};

const getDocumentsCount = async ({ search = "", document_type_id, sector_id, series_year, status = "active" }) => {
  const conditions = ["d.status = $1"];
  const params = [status];
  let idx = 2;

  if (search) {
    conditions.push(`(d.title ILIKE $${idx} OR d.document_number ILIKE $${idx} OR d.content_text ILIKE $${idx} OR d.author ILIKE $${idx})`);
    params.push(`%${search}%`);
    idx++;
  }
  if (document_type_id) {
    conditions.push(`d.document_type_id = $${idx}`);
    params.push(parseInt(document_type_id));
    idx++;
  }
  if (sector_id) {
    conditions.push(`d.sector_id = $${idx}`);
    params.push(parseInt(sector_id));
    idx++;
  }
  if (series_year) {
    conditions.push(`d.series_year = $${idx}`);
    params.push(parseInt(series_year));
    idx++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await pool.query(
    `SELECT COUNT(*) FROM documents d ${where}`,
    params
  );
  return parseInt(result.rows[0].count);
};

// ── Get single document with related data ───────────────────
const getDocumentById = async (id) => {
  const doc = await pool.query(
    `SELECT d.*, dt.type_name,
            s.sector_name, sub.subsector_name,
            u.full_name AS uploaded_by_name
     FROM documents d
     LEFT JOIN document_types dt ON dt.id = d.document_type_id
     LEFT JOIN sector s ON s.id = d.sector_id
     LEFT JOIN subsector sub ON sub.id = d.subsector_id
     LEFT JOIN users u ON u.user_id = d.uploaded_by
     WHERE d.document_id = $1`,
    [id]
  );
  if (!doc.rows[0]) return null;

  const files = await pool.query(
    `SELECT * FROM document_files WHERE document_id = $1 ORDER BY file_order, id`,
    [id]
  );

  const members = await pool.query(
    `SELECT * FROM document_members_present WHERE document_id = $1 ORDER BY is_present DESC, member_name`,
    [id]
  );

  const committees = await pool.query(
    `SELECT dc.*, json_agg(json_build_object('id', cm.id, 'member_name', cm.member_name, 'role', cm.role) ORDER BY cm.role, cm.member_name) AS members
     FROM document_committees dc
     LEFT JOIN committee_members cm ON cm.committee_id = dc.id
     WHERE dc.document_id = $1
     GROUP BY dc.id
     ORDER BY dc.committee_order`,
    [id]
  );

  return {
    ...doc.rows[0],
    files: files.rows,
    members_present: members.rows,
    committees: committees.rows,
  };
};

// ── Create document ─────────────────────────────────────────
const createDocument = async (data) => {
  const result = await pool.query(
    `INSERT INTO documents
       (document_type_id, sector_id, subsector_id, document_number, series_year,
        title, session_date, session_type, session_number,
        author, presiding_officer, attested_by, approved_by,
        content_text, description, status, uploaded_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
     RETURNING *`,
    [
      data.document_type_id, data.sector_id || null, data.subsector_id || null,
      data.document_number, data.series_year, data.title,
      data.session_date || null, data.session_type || null, data.session_number || null,
      data.author || null, data.presiding_officer || null,
      data.attested_by || null, data.approved_by || null,
      data.content_text || null, data.description || null,
      data.status || "active", data.uploaded_by || null,
    ]
  );
  return result.rows[0];
};

// ── Update document ─────────────────────────────────────────
const updateDocument = async (id, data) => {
  const result = await pool.query(
    `UPDATE documents SET
       document_type_id = $1, sector_id = $2, subsector_id = $3,
       document_number = $4, series_year = $5, title = $6,
       session_date = $7, session_type = $8, session_number = $9,
       author = $10, presiding_officer = $11, attested_by = $12, approved_by = $13,
       content_text = $14, description = $15,
       status = $16, updated_at = CURRENT_TIMESTAMP
     WHERE document_id = $17
     RETURNING *`,
    [
      data.document_type_id, data.sector_id || null, data.subsector_id || null,
      data.document_number, data.series_year, data.title,
      data.session_date || null, data.session_type || null, data.session_number || null,
      data.author || null, data.presiding_officer || null,
      data.attested_by || null, data.approved_by || null,
      data.content_text || null, data.description || null,
      data.status || "active", id,
    ]
  );
  return result.rows[0];
};

// ── Delete (archive) document ───────────────────────────────
const archiveDocument = async (id) => {
  await pool.query(
    `UPDATE documents SET status = 'archived', updated_at = CURRENT_TIMESTAMP WHERE document_id = $1`,
    [id]
  );
};

// ── Save document files ─────────────────────────────────────
const addDocumentFiles = async (document_id, files) => {
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    await pool.query(
      `INSERT INTO document_files (document_id, file_name, file_path, file_type, file_size, file_order)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [document_id, f.originalname, f.path, f.mimetype, f.size, i]
    );
  }
};

const removeDocumentFile = async (fileId) => {
  const result = await pool.query(
    `DELETE FROM document_files WHERE id = $1 RETURNING *`,
    [fileId]
  );
  return result.rows[0];
};

// ── Save members present ────────────────────────────────────
const setMembersPresent = async (document_id, members) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM document_members_present WHERE document_id = $1", [document_id]);
    for (const m of members) {
      await client.query(
        `INSERT INTO document_members_present (document_id, member_name, position, is_present)
         VALUES ($1, $2, $3, $4)`,
        [document_id, m.member_name, m.position || null, m.is_present !== false]
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// ── Save committees ─────────────────────────────────────────
const setCommittees = async (document_id, committees) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `DELETE FROM document_committees WHERE document_id = $1`,
      [document_id]
    );
    for (let i = 0; i < committees.length; i++) {
      const c = committees[i];
      const cRes = await client.query(
        `INSERT INTO document_committees (document_id, committee_name, committee_order)
         VALUES ($1, $2, $3) RETURNING id`,
        [document_id, c.committee_name, i + 1]
      );
      const committeeId = cRes.rows[0].id;
      if (c.members && c.members.length) {
        for (const m of c.members) {
          await client.query(
            `INSERT INTO committee_members (committee_id, member_name, role)
             VALUES ($1, $2, $3)`,
            [committeeId, m.member_name, m.role || "Member"]
          );
        }
      }
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// ── Get document types ──────────────────────────────────────
const getDocumentTypes = async () => {
  const result = await pool.query(
    "SELECT id, type_name FROM document_types WHERE status = true ORDER BY type_name"
  );
  return result.rows;
};

// ── Get distinct series years ───────────────────────────────
const getSeriesYears = async () => {
  const result = await pool.query(
    "SELECT DISTINCT series_year FROM documents WHERE status = 'active' ORDER BY series_year DESC"
  );
  return result.rows.map((r) => r.series_year);
};

module.exports = {
  getDocuments,
  getDocumentsCount,
  getDocumentById,
  createDocument,
  updateDocument,
  archiveDocument,
  addDocumentFiles,
  removeDocumentFile,
  setMembersPresent,
  setCommittees,
  getDocumentTypes,
  getSeriesYears,
};
