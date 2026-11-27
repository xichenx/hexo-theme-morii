ALTER TABLE sites ADD COLUMN first_seen INTEGER;

CREATE INDEX sites_first_seen ON sites(first_seen) WHERE first_seen IS NOT NULL;
