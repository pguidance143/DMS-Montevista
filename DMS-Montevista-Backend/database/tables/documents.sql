-- ============================================================
-- DROP old tables (reverse dependency order)
-- Re-run this file to cleanly rebuild all document tables.
-- ============================================================
DROP TABLE IF EXISTS committee_members      CASCADE;
DROP TABLE IF EXISTS document_committees    CASCADE;
DROP TABLE IF EXISTS document_members_present CASCADE;
DROP TABLE IF EXISTS document_files         CASCADE;
DROP TABLE IF EXISTS documents              CASCADE;
DROP TABLE IF EXISTS document_types         CASCADE;

-- ============================================================
-- Table: document_types
-- Stores types of documents (Resolution, Ordinance, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS document_types (
  id        SERIAL       PRIMARY KEY,
  type_name VARCHAR(100) UNIQUE NOT NULL,
  status    BOOLEAN      NOT NULL DEFAULT TRUE
);

-- Seed default document types
INSERT INTO document_types (type_name) VALUES
  ('Resolution'),
  ('Ordinance'),
  ('Executive Order'),
  ('Memorandum'),
  ('Proclamation')
ON CONFLICT (type_name) DO NOTHING;

-- ============================================================
-- Table: documents
-- Main document storage with metadata for resolutions and
-- other legislative documents from the Sangguniang Bayan.
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  document_id      SERIAL        PRIMARY KEY,

  -- Classification
  document_type_id INTEGER       NOT NULL REFERENCES document_types(id),
  sector_id        INTEGER       REFERENCES sector(id),
  subsector_id     INTEGER       REFERENCES subsector(id),

  -- Document identity
  document_number  VARCHAR(50)   NOT NULL,       -- e.g. "153"
  series_year      INTEGER       NOT NULL,       -- e.g. 2025
  title            TEXT          NOT NULL,        -- full title / subject

  -- Session details (for resolutions)
  session_date     DATE,
  session_type     VARCHAR(50),                  -- Regular, Special
  session_number   VARCHAR(50),                  -- 1st, 2nd, etc.

  -- Signatories
  author           VARCHAR(255),                 -- sponsor / author of the motion
  presiding_officer VARCHAR(255),                -- e.g. Vice Mayor
  attested_by      VARCHAR(255),                 -- Secretary to the Sanggunian
  approved_by      VARCHAR(255),                 -- Municipal Mayor

  -- Searchable content
  content_text     TEXT,                         -- full extracted text for search
  description      TEXT,                         -- brief summary / notes

  -- Status & tracking
  status           VARCHAR(20)   NOT NULL DEFAULT 'active',  -- active, archived, draft
  uploaded_by      INTEGER       REFERENCES users(user_id) ON DELETE SET NULL,
  created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,

  -- Unique constraint: no duplicate document number + series year per type
  UNIQUE (document_type_id, document_number, series_year)
);

-- Indexes for search performance
CREATE INDEX IF NOT EXISTS idx_documents_type       ON documents (document_type_id);
CREATE INDEX IF NOT EXISTS idx_documents_sector     ON documents (sector_id);
CREATE INDEX IF NOT EXISTS idx_documents_series     ON documents (series_year);
CREATE INDEX IF NOT EXISTS idx_documents_status     ON documents (status);
CREATE INDEX IF NOT EXISTS idx_documents_created    ON documents (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_search     ON documents USING gin (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(content_text,'') || ' ' || coalesce(description,'')));

-- ============================================================
-- Table: document_files
-- Stores multiple uploaded files per document (pages/scans)
-- ============================================================
CREATE TABLE IF NOT EXISTS document_files (
  id           SERIAL       PRIMARY KEY,
  document_id  INTEGER      NOT NULL REFERENCES documents(document_id) ON DELETE CASCADE,
  file_name    VARCHAR(255) NOT NULL,
  file_path    VARCHAR(500) NOT NULL,
  file_type    VARCHAR(50),               -- application/pdf, image/png, etc.
  file_size    BIGINT,                    -- bytes
  file_order   INTEGER      DEFAULT 0,   -- display/page order
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_document_files_doc ON document_files (document_id);

-- ============================================================
-- Table: document_members_present
-- Tracks which SB members were present/absent at the session
-- ============================================================
CREATE TABLE IF NOT EXISTS document_members_present (
  id          SERIAL       PRIMARY KEY,
  document_id INTEGER      NOT NULL REFERENCES documents(document_id) ON DELETE CASCADE,
  member_name VARCHAR(255) NOT NULL,
  position    VARCHAR(100),               -- Vice Mayor/Presiding, SB Member, etc.
  is_present  BOOLEAN      NOT NULL DEFAULT TRUE,
  UNIQUE (document_id, member_name)
);

-- ============================================================
-- Table: document_committees
-- Committees defined in a resolution
-- ============================================================
CREATE TABLE IF NOT EXISTS document_committees (
  id             SERIAL       PRIMARY KEY,
  document_id    INTEGER      NOT NULL REFERENCES documents(document_id) ON DELETE CASCADE,
  committee_name VARCHAR(255) NOT NULL,
  committee_order INTEGER     DEFAULT 0,     -- display order (1, 2, 3...)
  UNIQUE (document_id, committee_name)
);

-- ============================================================
-- Table: committee_members
-- Members assigned to each committee with their roles
-- ============================================================
CREATE TABLE IF NOT EXISTS committee_members (
  id             SERIAL       PRIMARY KEY,
  committee_id   INTEGER      NOT NULL REFERENCES document_committees(id) ON DELETE CASCADE,
  member_name    VARCHAR(255) NOT NULL,
  role           VARCHAR(50)  NOT NULL DEFAULT 'Member',  -- Chairperson, Vice Chairperson, Member
  UNIQUE (committee_id, member_name)
);

CREATE INDEX IF NOT EXISTS idx_committee_members_committee ON committee_members (committee_id);
