import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const db = new pg.Pool({
  connectionString: process.env.DB_CONN,
});

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// Authentication middleware to protect routes
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = data.user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};
// This route is just for testing if the server is up and running
app.get("/", (req, res) => {
  res.status(200).json("You've reached the server");
});
// Get all appointments with optional filters for category, date range, and user
app.get("/appointments", authenticateUser, async (req, res) => {
  try {
    const { category, from, to, range } = req.query;

    let conditions = [];
    let values = [];
    let index = 1;

    const userId = req.user.id;

    conditions.push(`a.user_id = $${index++}`);
    values.push(userId);

    if (category) {
      conditions.push(`c.category_name = $${index++}`);
      values.push(category);
    }

    if (from) {
      conditions.push(`a.appointment_datetime >= $${index++}`);
      values.push(from);
    }

    if (to) {
      conditions.push(`a.appointment_datetime <= $${index++}`);
      values.push(to);
    }

    if (range === "upcoming") {
      conditions.push(`a.appointment_datetime >= NOW()`);
    }

    if (range === "past") {
      conditions.push(`a.appointment_datetime < NOW()`);
    }

    if (range === "today") {
      conditions.push(`DATE(a.appointment_datetime) = CURRENT_DATE`);
    }

    if (range === "week") {
      conditions.push(
        `a.appointment_datetime BETWEEN NOW() AND NOW() + INTERVAL '7 days'`,
      );
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await db.query(
      `
      SELECT 
        a.id AS appointment_id,
        a.title AS appointment_title,
        a.appointment_datetime AS scheduled_at,
        a.timezone AS meeting_timezone,
        c.category_name AS category,
        array_agg(
          json_build_object(
            'reminder_id', r.id,
            'remind_before_minutes', r.reminder_minutes
          )
        ) FILTER (WHERE r.id IS NOT NULL) AS reminders
      FROM appointments a
      LEFT JOIN categories c 
        ON a.category_id = c.id
      LEFT JOIN reminders r 
        ON a.id = r.appointment_id
      ${whereClause}
      GROUP BY a.id, c.category_name
      ORDER BY a.appointment_datetime
      `,
      values,
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Get all categories for dropdowns and filtering
app.get("/categories", authenticateUser, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, category_name FROM categories ORDER BY category_name",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get appointment using single ID, useful for editing an appointment
app.get("/appointments/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `
      SELECT 
        a.id AS appointment_id,
        a.title AS appointment_title,
        a.appointment_datetime AS scheduled_at,
        a.timezone AS meeting_timezone,
        c.category_name AS category,
        array_agg(
          json_build_object(
            'reminder_id', r.id,
            'remind_before_minutes', r.reminder_minutes
          )
        ) FILTER (WHERE r.id IS NOT NULL) AS reminders
      FROM appointments a
      LEFT JOIN categories c 
        ON a.category_id = c.id
      LEFT JOIN reminders r 
        ON a.id = r.appointment_id
      WHERE a.id = $1 AND a.user_id = $2

      GROUP BY a.id, c.category_name
      `,
      [id, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Create new appointment with optional reminders
app.post("/appointments", authenticateUser, async (req, res) => {
  try {
    const {
      title,
      appointment_datetime,
      timezone,
      category_id,
      user_id,
      reminders,
    } = req.body;
    const userId = req.user.id;
    const newAppointment = await db.query(
      `INSERT INTO appointments
       (title, appointment_datetime, timezone, category_id, user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, appointment_datetime, timezone, category_id, userId],
    );

    const appointmentId = newAppointment.rows[0].id;

    if (reminders && reminders.length > 0) {
      for (let minutes of reminders) {
        await db.query(
          `INSERT INTO reminders (appointment_id, reminder_minutes)
           VALUES ($1, $2)`,
          [appointmentId, minutes],
        );
      }
    }

    res.status(201).json(newAppointment.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new category (admin functionality, can be extended to allow users to create their own categories)

app.post("/categories", authenticateUser, async (req, res) => {
  try {
    const { category_name } = req.body;

    const result = await db.query(
      "INSERT INTO categories (category_name) VALUES ($1) RETURNING *",
      [category_name],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete appointment by ID, also deletes associated reminders due to ON DELETE CASCADE
app.delete("/appointments/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM appointments WHERE id=$1 AND user_id=$2", [
      id,
      req.user.id,
    ]);

    res.json({ message: "Appointment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Additional routes for updating appointments, managing categories, etc. can be added here
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
