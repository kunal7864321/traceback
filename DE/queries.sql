-- TraceBack: Project-specific PostgreSQL queries
-- Run in pgAdmin Query Tool against traceback_db.
-- Query outputs depend on the current database contents.

-- 1. Retrieve active lost reports
SELECT *
FROM reports
WHERE report_type = 'LOST'
  AND status = 'ACTIVE'
ORDER BY created_at DESC;

-- 2. Retrieve active found reports
SELECT *
FROM reports
WHERE report_type = 'FOUND'
  AND status = 'ACTIVE'
ORDER BY created_at DESC;

-- 3. Search reports by category
SELECT r.report_id, r.title, r.report_type, c.category_name
FROM reports r
JOIN categories c ON r.category_id = c.category_id
WHERE c.category_name = 'Electronics';

-- 4. Search reports by brand
SELECT report_id, title, brand, colour
FROM reports
WHERE LOWER(brand) = LOWER('Dell');

-- 5. Calculate a matching score for the sample report pair
SELECT calculate_match_score(1, 2);

-- 6. Generate eligible matches
SELECT generate_matches();

-- 7. Retrieve matches from the admin dashboard view
SELECT match_id, lost_item, found_item, match_score, match_status
FROM admin_match_dashboard
ORDER BY match_score DESC;

-- 8. Count reports by category
SELECT c.category_name, COUNT(r.report_id) AS total_reports
FROM categories c
LEFT JOIN reports r ON c.category_id = r.category_id
GROUP BY c.category_name
ORDER BY total_reports DESC;

-- 9. Find categories with more than one report
SELECT c.category_name, COUNT(r.report_id) AS total_reports
FROM categories c
JOIN reports r ON c.category_id = r.category_id
GROUP BY c.category_name
HAVING COUNT(r.report_id) > 1;

-- 10. Mark one unread notification as read, if one exists
UPDATE notifications
SET is_read = TRUE
WHERE notification_id = (
    SELECT notification_id
    FROM notifications
    WHERE is_read = FALSE
    ORDER BY notification_id
    LIMIT 1
)
RETURNING *;

-- Additional safe DELETE demonstration: deletes no real project record.
BEGIN;
DELETE FROM report_attributes
WHERE report_id = -999;
ROLLBACK;

-- Optional: inspect recent audit entries
SELECT *
FROM audit_logs
ORDER BY created_at DESC
LIMIT 10;
