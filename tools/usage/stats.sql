SELECT COUNT(*) AS total_sites,
       COUNT(CASE WHEN last_seen >= unixepoch('now', '-30 days') THEN 1 END) AS active_sites_30d,
       COUNT(*) - COUNT(first_seen) AS unknown_first_seen_sites
FROM sites;

SELECT version, COUNT(*) AS total_sites,
       COUNT(CASE WHEN last_seen >= unixepoch('now', '-30 days') THEN 1 END) AS active_sites_30d
FROM sites
GROUP BY version
ORDER BY total_sites DESC, version;

SELECT date(first_seen, 'unixepoch', '-6 days', 'weekday 1') AS week_start_utc,
       COUNT(*) AS new_sites
FROM sites
WHERE first_seen IS NOT NULL
GROUP BY week_start_utc
ORDER BY week_start_utc DESC;

SELECT strftime('%Y-%m', first_seen, 'unixepoch') AS month_utc,
       COUNT(*) AS new_sites
FROM sites
WHERE first_seen IS NOT NULL
GROUP BY month_utc
ORDER BY month_utc DESC;
