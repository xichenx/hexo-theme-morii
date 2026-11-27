-- Base schema. Apply the Wrangler migrations after initializing a new database.
CREATE TABLE IF NOT EXISTS sites (
  site_id TEXT PRIMARY KEY,
  version TEXT NOT NULL,
  last_seen INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS sites_last_seen ON sites(last_seen);
