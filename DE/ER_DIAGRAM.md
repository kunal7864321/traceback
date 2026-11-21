# TraceBack ER Diagram

The following Mermaid ER diagram represents the principal entities and relationships in the TraceBack PostgreSQL database.

```mermaid
erDiagram
    USERS ||--o{ REPORTS : creates
    ORGANIZATIONS ||--o{ LOCATIONS : contains
    ORGANIZATIONS ||--o{ REPORTS : receives
    LOCATIONS ||--o{ REPORTS : identifies
    CATEGORIES ||--o{ REPORTS : classifies
    REPORTS ||--o{ REPORT_ATTRIBUTES : has
    REPORTS ||--o{ MATCH_RESULTS : lost_or_found
    MATCH_RESULTS ||--o{ CLAIMS : receives
    USERS ||--o{ CLAIMS : submits
    CLAIMS ||--o{ CLAIM_EVIDENCE : includes
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ AUDIT_LOGS : performs
    CLAIMS ||--o| RECOVERIES : results_in
```

**Note:** `MATCH_RESULTS` references `REPORTS` twice: once for the lost report and once for the found report. The diagram shows the conceptual relationship; use the actual PostgreSQL foreign-key definitions as the final authority for cardinality and optionality.
