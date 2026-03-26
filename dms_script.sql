-- ============================================================
-- DMS MONTEVISTA — Full Schema + Seed Data
-- Run this script in PostgreSQL (psql or pgAdmin)
-- ============================================================

-- ── 0. DROP ORDER (respect FK dependencies) ─────────────────
DROP TABLE IF EXISTS committee_members;
DROP TABLE IF EXISTS document_committees;
DROP TABLE IF EXISTS document_members_present;
DROP TABLE IF EXISTS document_files;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS document_types;
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS role_pages;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS pages;

-- ── 1. USERS TABLE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    user_id       SERIAL PRIMARY KEY,
    username      VARCHAR(50)  UNIQUE NOT NULL,
    full_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id       INTEGER,
    department_id INTEGER,
    device_id     VARCHAR(150),  -- MAC address or device identifier
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, full_name, email, password_hash, role_id, department_id, device_id) VALUES
('JGVILLANUEVA', 'Jorge Rustom Villanueva', 'jgvillanueva@hijoresources.com',
 '$2b$12$tosVNVm2JGmelWNm7SmGhu9h5.5Coa4h3YXMGNyaS8Q3AryDxoJMO', 1, 2, '00-14-22-01-23-45')
ON CONFLICT (username) DO NOTHING;

-- ── 2. ROLES TABLE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roles (
    role_id     SERIAL PRIMARY KEY,
    role_name   VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active   BOOLEAN   DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── 3. PAGES TABLE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pages (
    page_id     SERIAL PRIMARY KEY,
    page_name   VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── 4. ROLE_PAGES JUNCTION TABLE ────────────────────────────
CREATE TABLE IF NOT EXISTS role_pages (
    id      SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
    page_id INTEGER NOT NULL REFERENCES pages(page_id) ON DELETE CASCADE,
    UNIQUE (role_id, page_id)
);

-- ── 5. ACTIVITY LOGS TABLE ──────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_logs (
    log_id      SERIAL PRIMARY KEY,
    user_id     INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    username    VARCHAR(50),   -- snapshot at time of action
    action      VARCHAR(100) NOT NULL,  -- e.g. LOGIN, CREATE_USER, DELETE_ROLE
    entity_type VARCHAR(50),            -- user | role | page | system
    entity_id   INTEGER,               -- PK of the affected record
    entity_name VARCHAR(255),          -- snapshot name at time of action
    details     TEXT,                  -- extra human-readable context
    ip_address  VARCHAR(45),           -- IPv4 or IPv6
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id   ON activity_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action     ON activity_logs (action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs (created_at DESC);

-- ── 6. DOCUMENT TYPES TABLE ───────────────────────────────────
CREATE TABLE IF NOT EXISTS document_types (
    id        SERIAL       PRIMARY KEY,
    type_name VARCHAR(100) UNIQUE NOT NULL,
    status    BOOLEAN      NOT NULL DEFAULT TRUE
);

-- ── 7. DOCUMENTS TABLE ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
    document_id      SERIAL        PRIMARY KEY,
    document_type_id INTEGER       NOT NULL REFERENCES document_types(id),
    sector_id        INTEGER       REFERENCES sector(id),
    subsector_id     INTEGER       REFERENCES subsector(id),
    document_number  VARCHAR(50)   NOT NULL,
    series_year      INTEGER       NOT NULL,
    title            TEXT          NOT NULL,
    session_date     DATE,
    session_type     VARCHAR(50),
    session_number   VARCHAR(50),
    author           VARCHAR(255),
    presiding_officer VARCHAR(255),
    attested_by      VARCHAR(255),
    approved_by      VARCHAR(255),
    content_text     TEXT,
    description      TEXT,
    status           VARCHAR(20)   NOT NULL DEFAULT 'active',
    uploaded_by      INTEGER       REFERENCES users(user_id) ON DELETE SET NULL,
    created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (document_type_id, document_number, series_year)
);

CREATE INDEX IF NOT EXISTS idx_documents_type       ON documents (document_type_id);
CREATE INDEX IF NOT EXISTS idx_documents_sector     ON documents (sector_id);
CREATE INDEX IF NOT EXISTS idx_documents_series     ON documents (series_year);
CREATE INDEX IF NOT EXISTS idx_documents_status     ON documents (status);
CREATE INDEX IF NOT EXISTS idx_documents_created    ON documents (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_search     ON documents USING gin (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(content_text,'') || ' ' || coalesce(description,'')));

-- ── 8. DOCUMENT FILES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS document_files (
    id           SERIAL       PRIMARY KEY,
    document_id  INTEGER      NOT NULL REFERENCES documents(document_id) ON DELETE CASCADE,
    file_name    VARCHAR(255) NOT NULL,
    file_path    VARCHAR(500) NOT NULL,
    file_type    VARCHAR(50),
    file_size    BIGINT,
    file_order   INTEGER      DEFAULT 0,
    created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_document_files_doc ON document_files (document_id);

-- ── 9. DOCUMENT MEMBERS PRESENT ──────────────────────────────
CREATE TABLE IF NOT EXISTS document_members_present (
    id          SERIAL       PRIMARY KEY,
    document_id INTEGER      NOT NULL REFERENCES documents(document_id) ON DELETE CASCADE,
    member_name VARCHAR(255) NOT NULL,
    position    VARCHAR(100),
    is_present  BOOLEAN      NOT NULL DEFAULT TRUE,
    UNIQUE (document_id, member_name)
);

-- ── 9. DOCUMENT COMMITTEES ───────────────────────────────────
CREATE TABLE IF NOT EXISTS document_committees (
    id             SERIAL       PRIMARY KEY,
    document_id    INTEGER      NOT NULL REFERENCES documents(document_id) ON DELETE CASCADE,
    committee_name VARCHAR(255) NOT NULL,
    committee_order INTEGER     DEFAULT 0,
    UNIQUE (document_id, committee_name)
);

-- ── 10. COMMITTEE MEMBERS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS committee_members (
    id             SERIAL       PRIMARY KEY,
    committee_id   INTEGER      NOT NULL REFERENCES document_committees(id) ON DELETE CASCADE,
    member_name    VARCHAR(255) NOT NULL,
    role           VARCHAR(50)  NOT NULL DEFAULT 'Member',
    UNIQUE (committee_id, member_name)
);

CREATE INDEX IF NOT EXISTS idx_committee_members_committee ON committee_members (committee_id);

-- ── SEED: DOCUMENT TYPES ──────────────────────────────────────
INSERT INTO document_types (type_name) VALUES
    ('Resolution'),
    ('Ordinance'),
    ('Executive Order'),
    ('Memorandum'),
    ('Proclamation')
ON CONFLICT (type_name) DO NOTHING;

-- ── SEED: PAGES ──────────────────────────────────────────
INSERT INTO pages (page_name, description) VALUES
    ('Documents',         'Access to personal and shared documents'),
    ('All Documents',     'View all documents across the system'),
    ('Document Tracking', 'Track incoming, outgoing, and for-action documents'),
    ('Approval',          'Manage document approval workflows'),
    ('User Management',   'Manage users, roles, and permissions'),
    ('System Settings',   'Configure system-wide settings'),
    ('Reports',           'View and generate system reports'),
    ('Audit Reports',     'Access to audit trail and activity logs')
ON CONFLICT (page_name) DO NOTHING;

-- ── 7. SEED: ROLES ──────────────────────────────────────────
INSERT INTO roles (role_name, description) VALUES
    ('Admin',       'Full access to all system modules'),
    ('Staff',       'Standard access for municipal staff'),
    ('Public User', 'Limited access for public-facing users')
ON CONFLICT (role_name) DO NOTHING;

-- ── 8. SEED: ROLE_PAGES ─────────────────────────────────────

-- Admin → all pages
INSERT INTO role_pages (role_id, page_id)
SELECT r.role_id, p.page_id
FROM roles r, pages p
WHERE r.role_name = 'Admin'
ON CONFLICT DO NOTHING;

-- Staff → documents, tracking, approval, reports
INSERT INTO role_pages (role_id, page_id)
SELECT r.role_id, p.page_id
FROM roles r
JOIN pages p ON p.page_name IN (
    'Documents', 'Document Tracking', 'Approval', 'Reports'
)
WHERE r.role_name = 'Staff'
ON CONFLICT DO NOTHING;

-- Public User → documents only
INSERT INTO role_pages (role_id, page_id)
SELECT r.role_id, p.page_id
FROM roles r
JOIN pages p ON p.page_name = 'Documents'
WHERE r.role_name = 'Public User'
ON CONFLICT DO NOTHING;

-- ── 9. FK: users.role_id → roles ────────────────────────────
ALTER TABLE users
    DROP CONSTRAINT IF EXISTS fk_users_role;
ALTER TABLE users
    ADD CONSTRAINT fk_users_role
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE SET NULL;

-- ── VERIFY ──────────────────────────────────────────────────
SELECT r.role_name, p.page_name
FROM role_pages rp
JOIN roles r ON r.role_id = rp.role_id
JOIN pages p ON p.page_id = rp.page_id
ORDER BY r.role_name, p.page_name;

SELECT 'activity_logs columns:' AS info,
       column_name, data_type
FROM information_schema.columns
WHERE table_name = 'activity_logs'
ORDER BY ordinal_position;
