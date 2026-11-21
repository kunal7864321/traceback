# TraceBack — Data Engineering Submission

This folder contains the Data Engineering documentation for **TraceBack: Intelligent Lost & Found Network**.

## Deliverables
- [Project report](PROJECT_REPORT.md)
- [ER diagram](ER_DIAGRAM.md)
- [SQL queries and operations](queries.sql)

## Evidence to add
Create an `evidence/` folder and add genuine screenshots captured from your own running application and pgAdmin:
1. Dashboard homepage
2. Successful report submission
3. Submitted report visible in PostgreSQL
4. Trigger-generated audit log
5. API health response
6. Reports and matches API responses
7. SQL query outputs
8. pgAdmin table list and indexes

## Run locally
- Backend: from the repository root, `cd backend && node server.js`
- Frontend: in another terminal, `cd frontend && npm run dev`
- Open the Vite local URL shown in the terminal.

Keep credentials in a private `.env` file. Never commit database passwords or real user secrets.

## Verification note
The current demonstrated application workflow includes report insertion and retrieval. Do not claim frontend update/delete workflows unless they are implemented and tested separately. Record actual query outputs in the evidence folder; do not fabricate screenshots or results.
