-- ============================================================
-- DMS MONTEVISTA — Full Schema + Seed Data
-- Run this script in PostgreSQL (psql or pgAdmin)
-- ============================================================

-- ── 0. DROP ORDER (respect FK dependencies) ─────────────────
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

-- ── 6. SEED: PAGES ──────────────────────────────────────────
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
