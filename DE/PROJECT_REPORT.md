# TraceBack — Intelligent Lost & Found Network
## Data Engineering Project Report

**Database:** PostgreSQL 18  
**Backend:** Node.js and Express.js  
**Frontend:** React.js with Vite  
**Database driver:** node-postgres (`pg`)  
**Database name:** `traceback_db`

---

## 1. Introduction

TraceBack is a centralized lost-and-found application. Users can submit lost or found item reports, browse reports, and view potential matches. The database stores structured information about users, organizations, locations, categories, reports, matches, claims, evidence, notifications, recoveries, and audit activity.

### Objectives
- Centralize lost and found item reporting.
- Store item, user, organization, and location information.
- Identify potential matches using a weighted rule-based score.
- Support claim, evidence, notification, and recovery records.
- Maintain audit records of important database events.
- Demonstrate integration between a React frontend, Express backend, and PostgreSQL.

## 2. Database selection and justification

PostgreSQL was selected because TraceBack contains strongly related entities and requires relational constraints and multi-table queries.

Reasons:
1. Relational tables model users, reports, locations, categories, matches, and claims.
2. Primary and foreign keys help enforce referential integrity.
3. CHECK and UNIQUE constraints help maintain valid data.
4. SQL supports joins, filtering, aggregation, and subqueries.
5. Indexes support frequent searches.
6. Stored functions, views, and triggers support matching and automated database actions.

## 3. System architecture

The application uses a three-layer architecture:

1. **Frontend:** React.js, Vite, Tailwind CSS, and Lucide React. It presents the dashboard and report form.
2. **Backend:** Node.js and Express.js. It exposes JSON API endpoints, validates report input, and uses the `pg` driver to execute parameterized SQL.
3. **Database:** PostgreSQL 18, database `traceback_db`, schema `public`.

**Request flow:** React frontend → Express API → PostgreSQL → JSON response → React UI.

### API endpoints currently implemented
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | API welcome response |
| GET | `/api/health` | Checks database connectivity |
| GET | `/api/reports` | Retrieves reports |
| POST | `/api/reports` | Inserts a report |
| GET | `/api/matches` | Retrieves matching results |

## 4. ER model and entities

The database contains 12 tables:

| Table | Purpose |
|---|---|
| users | User details |
| organizations | Participating organizations |
| locations | Locations belonging to organizations |
| categories | Item categories |
| reports | Lost and found reports |
| report_attributes | Additional item attributes |
| match_results | Potential lost/found matches |
| claims | Claims submitted against matches |
| claim_evidence | Evidence supporting claims |
| notifications | User notifications |
| audit_logs | Audit trail |
| recoveries | Recovery and handover records |

### Main relationships
- One user can create many reports.
- One organization can contain many locations and receive many reports.
- One category can classify many reports.
- One report can have many report attributes.
- Reports participate in match records as lost or found reports.
- One match can have multiple claims.
- One claim can have multiple evidence records and at most one recovery record.
- One user can receive many notifications and create many audit events.

See [ER_DIAGRAM.md](ER_DIAGRAM.md) for the relationship diagram.

## 5. Normalization

The schema separates entities with their own identifiers and references them through foreign keys.

### First Normal Form (1NF)
- Each table has rows identified by a key.
- Individual fields store single values.
- Repeating item properties are represented as separate rows in `report_attributes`, rather than repeating columns in `reports`.

### Second Normal Form (2NF)
- Tables use primary keys to identify records.
- Descriptive attributes are stored with the entity they describe.
- The design avoids storing organization, category, and user descriptions repeatedly in every report.

### Third Normal Form (3NF)
- User details are stored in `users`.
- Organization details are stored in `organizations`.
- Location details are stored in `locations`.
- Category details are stored in `categories`.
- Reports reference these entities through foreign keys instead of duplicating their descriptive attributes.

### Example functional dependencies
- `user_id → full_name, email, created_at`
- `organization_id → organization_name, organization_type, city`
- `category_id → category_name`
- `location_id → organization_id, location_name`
- `report_id → reporter_user_id, organization_id, location_id, category_id, report_type, title, description, brand, colour, event_time, status`

These examples should be checked against the final table definitions before presenting a formal dependency proof.

## 6. Database implementation

PostgreSQL database: `traceback_db`.

The implementation includes 12 tables with primary keys, foreign keys, unique constraints, NOT NULL constraints, default values, and CHECK constraints where appropriate.

Sample records include a demonstration user, organizations such as Newton School of Technology, Phoenix Marketcity, and Pune Railway Station, associated locations, item categories, and sample lost/found reports.

## 7. Matching logic, functions, views, triggers, and indexes

### Weighted matching function
The function `calculate_match_score(p_lost_report_id, p_found_report_id)` calculates a weighted similarity score:

| Matching factor | Weight |
|---|---:|
| Category | 20 |
| Brand | 20 |
| Colour | 15 |
| Item Type attribute | 20 |
| Model attribute | 25 |
| **Total** | **100** |

The score is returned as a numeric value. The function's implementation determines how each factor contributes.

### Match generation
`generate_matches()` compares active LOST reports with active FOUND reports and inserts eligible pairs with scores of at least 60. A unique pair constraint and conflict handling prevent duplicate pairs.

### Views
- `admin_match_dashboard`
- `user_reports_dashboard`

### Triggers
- `trg_report_creation`: records report creation in `audit_logs`.
- `trg_notify_new_match`: creates a notification when a new match row is inserted.
- `trg_notify_claim_status_change`: creates a notification when a claim status changes.

### Indexes
The following eight indexes were created:
- `idx_reports_type_status`
- `idx_reports_organization_location`
- `idx_reports_category`
- `idx_reports_brand`
- `idx_report_attributes_name_value`
- `idx_match_results_status_score`
- `idx_notifications_user_read`
- `idx_claims_status`

## 8. Project-specific SQL operations

The accompanying [queries.sql](queries.sql) contains queries for:
- Lost and found report retrieval.
- Category and brand search.
- Joining reports to categories.
- Calculating match scores.
- Generating matches.
- Viewing the match dashboard.
- Aggregating report counts by category.
- GROUP BY and HAVING.
- Updating notification read status.
- A safe transactional DELETE demonstration.

Execute the queries in pgAdmin and attach screenshots of the actual outputs. The output depends on the database's current records and should not be invented.

## 9. Database and application integration

The Express backend connects to PostgreSQL using the `pg` connection pool. Database credentials are loaded from a private `.env` file and must not be committed.

Integration checks completed:
1. The backend health endpoint returned a successful PostgreSQL connection response.
2. GET `/api/reports` retrieved database records.
3. GET `/api/matches` retrieved matching results.
4. A report was submitted through the React dashboard.
5. The new report appeared in the PostgreSQL `reports` table.
6. The report-creation trigger generated an audit log entry.

This verifies frontend-to-backend report insertion and database retrieval.

**Current scope limitation:** The demonstrated frontend workflow covers report creation and retrieval. Do not claim that application-level update and delete workflows are complete unless separately implemented and tested.

## 10. Data integrity and performance

Integrity is supported through primary keys, foreign keys, unique constraints, check constraints, required fields, and parameterized SQL statements. Eight indexes support common filtering and lookup operations.

Potential future performance work includes query-plan analysis with EXPLAIN ANALYZE, pagination, and index tuning based on real workloads.

## 11. Future enhancements

- Authentication and role-based access.
- Image upload and image-based matching.
- More advanced similarity algorithms.
- Email or push notifications.
- Full admin and claim-review workflows.
- Frontend update and delete operations.
- Deployment with managed PostgreSQL and backend hosting.

## 12. Conclusion

TraceBack demonstrates relational database design and implementation through a working application. PostgreSQL stores the application's structured entities and supports constraints, indexes, views, stored functions, and triggers. The Node.js backend connects the database to a React dashboard. Successful report submission, retrieval, and automatic audit logging demonstrate meaningful database-backend integration.

## 13. Evidence checklist

Add genuine screenshots under an `evidence/` directory:
1. pgAdmin database showing the 12 tables.
2. ER diagram.
3. Sample records.
4. Indexes.
5. Matching function execution.
6. Match generation and results.
7. Trigger-generated audit log.
8. React dashboard.
9. Successful report submission.
10. Submitted report visible in PostgreSQL.
11. API health response.
12. Reports and matches API responses.
13. SQL query execution outputs.
