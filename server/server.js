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
      SELECT a.*, c.category_name
      FROM appointments a
      LEFT JOIN categories c ON a.category_id = c.id
      ORDER BY appointment_datetime
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
