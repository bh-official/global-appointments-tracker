import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const db = new pg.Pool({
  connectionString: process.env.DB_CONN,
});

app.get("/", (req, res) => {
  res.status(200).json({ message: "You've reached the server" });
});

app.get("/appointments", async (req, res) => {
  try {
    const { user_id, category, from, to } = req.query;

    let conditions = [];
    let values = [];
    let index = 1;

    if (user_id) {
      conditions.push(`a.user_id = $${index++}`);
      values.push(user_id);
    }

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

// get appointment using single Id
app.get("/appointments/:id", async (req, res) => {
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
      WHERE a.id = $1
      GROUP BY a.id, c.category_name
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/appointments", async (req, res) => {
  try {
    const {
      title,
      appointment_datetime,
      timezone,
      category_id,
      user_id,
      reminders,
    } = req.body;

    const newAppointment = await db.query(
      `INSERT INTO appointments
       (title, appointment_datetime, timezone, category_id, user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, appointment_datetime, timezone, category_id, user_id],
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

app.delete("/appointments/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM appointments WHERE id=$1", [id]);

    res.json({ message: "Appointment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
