
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to TraceBack API"
  });
});

// Database connection test
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS time");

    res.json({
      status: "success",
      message: "PostgreSQL connected successfully",
      database_time: result.rows[0].time
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      status: "error",
      message: "Database connection failed"
    });
  }
});

// Get all reports
app.get("/api/reports", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        r.report_id,
        r.report_type,
        r.title,
        r.description,
        r.brand,
        r.colour,
        r.status,
        c.category_name,
        o.organization_name,
        l.location_name
      FROM reports r
      JOIN categories c ON r.category_id = c.category_id
      JOIN organizations o ON r.organization_id = o.organization_id
      JOIN locations l ON r.location_id = l.location_id
      ORDER BY r.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "Could not fetch reports"
    });
  }
});


// Create a lost or found report
app.post("/api/reports", async (req, res) => {
  try {
    const {
      reporter_user_id,
      organization_id,
      location_id,
      category_id,
      report_type,
      title,
      description,
      brand,
      colour
    } = req.body;

    if (
      !reporter_user_id ||
      !organization_id ||
      !location_id ||
      !category_id ||
      !["LOST", "FOUND"].includes(report_type) ||
      !title
    ) {
      return res.status(400).json({
        message: "Please provide all required report details"
      });
    }

    const result = await pool.query(
      `INSERT INTO reports (
        reporter_user_id, organization_id, location_id,
        category_id, report_type, title, description,
        brand, colour
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *`,
      [
        reporter_user_id, organization_id, location_id,
        category_id, report_type, title, description,
        brand, colour
      ]
    );

    res.status(201).json({
      message: "Report created successfully",
      report: result.rows[0]
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Could not create report" });
  }
});

// Get matching results
app.get("/api/matches", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        m.match_id,
        lost.title AS lost_item,
        found.title AS found_item,
        m.match_score,
        m.match_status,
        m.matching_reason
      FROM match_results m
      JOIN reports lost
        ON m.lost_report_id = lost.report_id
      JOIN reports found
        ON m.found_report_id = found.report_id
      ORDER BY m.match_score DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Could not fetch matches" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`TraceBack API running on port ${PORT}`);
});
