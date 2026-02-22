import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import cron from "node-cron";

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

  COUNT(DISTINCT l.id) AS like_count,

  COALESCE(
    MAX(CASE WHEN l.user_id = $1 THEN 1 ELSE 0 END),
    0
  ) = 1 AS liked_by_user,

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
LEFT JOIN appointment_likes l 
  ON a.id = l.appointment_id

${whereClause}

GROUP BY a.id, c.category_name
ORDER BY a.appointment_datetime

      `,
      values,
    );

    res.json(result.rows);
  } catch (err) {
    console.error("APPOINTMENTS ERROR:", err);
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

// Get appointment by ID
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

    // SERVER-SIDE VALIDATION: Prevent past appointments
    const now = new Date();
    if (new Date(appointment_datetime) < now) {
      return res.status(400).json({ error: "Cannot schedule appointments in the past." });
    }

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

// Categories

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

app.post("/appointments/:id/like", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await db.query(
      `INSERT INTO appointment_likes (appointment_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [id, userId],
    );

    res.json({ message: "Liked successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update
app.put("/appointments/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, appointment_datetime, timezone, category_id, reminders } = req.body;
    const userId = req.user.id;

    // SERVER-SIDE VALIDATION: Prevent past appointments
    const now = new Date();
    if (new Date(appointment_datetime) < now) {
      return res.status(400).json({ error: "Cannot set appointment to a past time." });
    }

    const result = await db.query(
      `UPDATE appointments
       SET title = $1,
           appointment_datetime = $2,
           timezone = $3,
           category_id = $4
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [title, appointment_datetime, timezone, category_id, id, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // UPDATE REMINDERS: Delete old and insert new
    // Also reset is_sent if the time was changed
    await db.query("DELETE FROM reminders WHERE appointment_id = $1", [id]);

    if (reminders && reminders.length > 0) {
      for (let minutes of reminders) {
        await db.query(
          `INSERT INTO reminders (appointment_id, reminder_minutes, is_sent)
           VALUES ($1, $2, FALSE)`,
          [id, minutes],
        );
      }
    }

    res.json(result.rows[0]);
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

app.delete("/appointments/:id/like", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await db.query(
      `DELETE FROM appointment_likes
       WHERE appointment_id = $1 AND user_id = $2`,
      [id, userId],
    );

    res.json({ message: "Unliked successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// EMAIL REMINDER LOGIC
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const checkAndSendReminders = async () => {
  try {
    const result = await db.query(`
      SELECT 
        r.id as reminder_id, 
        r.reminder_minutes, 
        a.id as appointment_id, 
        a.title, 
        a.appointment_datetime, 
        a.user_id 
      FROM reminders r
      JOIN appointments a ON r.appointment_id = a.id
      WHERE r.is_sent = FALSE
        AND (a.appointment_datetime - (r.reminder_minutes * INTERVAL '1 minute')) <= NOW()
        AND a.appointment_datetime > NOW() - INTERVAL '1 day';
    `);

    for (let reminder of result.rows) {
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(reminder.user_id);

      if (userError || !userData.user) {
        console.error(`User not found for reminder ${reminder.reminder_id}:`, userError);
        continue;
      }

      const userEmail = userData.user.email;

      const mailOptions = {
        from: '"Global Appointments" <no-reply@appointments.com>',
        to: userEmail,
        subject: `Reminder: ${reminder.title}`,
        text: `Hello! This is a reminder that your appointment "${reminder.title}" is scheduled for ${new Date(reminder.appointment_datetime).toLocaleString()}.`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #0d9488;">Appointment Reminder</h2>
            <p>Hello!</p>
            <p>This is a reminder for your upcoming appointment:</p>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0;">${reminder.title}</h3>
              <p style="margin: 5px 0; color: #64748b;">Scheduled for: ${new Date(reminder.appointment_datetime).toLocaleString()}</p>
            </div>
            <p style="font-size: 14px; color: #94a3b8;">Sent via Global Appointments Tracker</p>
          </div>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${userEmail} for reminder ${reminder.reminder_id}`);

        await db.query(`UPDATE reminders SET is_sent = TRUE WHERE id = $1`, [reminder.reminder_id]);
      } catch (sendError) {
        console.error(`Failed to send email to ${userEmail}:`, sendError);
      }
    }
  } catch (err) {
    console.error("CRON ERROR:", err);
  }
};

// Run every minute
cron.schedule("* * * * *", () => {
  console.log("Checking for reminders...");
  checkAndSendReminders();
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
