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
    const result = await db.query(`
      SELECT 
        a.id,
        a.title,
        a.appointment_datetime,
        a.timezone,
        c.category_name,
        json_agg(r.reminder_minutes) AS reminders
      FROM appointments a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN reminders r ON a.id = r.appointment_id
      GROUP BY a.id, c.category_name
      ORDER BY a.appointment_datetime
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// app.post("/appointments", (req, res) => {
//   console.log("POST hit");
//   res.json({ test: "Route working" });
// });

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

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
