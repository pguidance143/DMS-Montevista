-- ============================================================
-- Table: sector
-- ============================================================
CREATE TABLE IF NOT EXISTS sector (
  id          SERIAL       PRIMARY KEY,
  sector_name VARCHAR(255) NOT NULL,
  status      BOOLEAN      NOT NULL DEFAULT TRUE
);

-- ============================================================
-- Table: subsector
-- FK: subsector.sector_id → sector.id (CASCADE on delete)
-- ============================================================
CREATE TABLE IF NOT EXISTS subsector (
  id             SERIAL       PRIMARY KEY,
  subsector_name VARCHAR(255) NOT NULL,
  sector_id      INT          NOT NULL,
  status         BOOLEAN      NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_subsector_sector
    FOREIGN KEY (sector_id) REFERENCES sector (id)
    ON DELETE CASCADE
);
