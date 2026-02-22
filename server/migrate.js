import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const db = new pg.Pool({
    connectionString: process.env.DB_CONN,
});

const migrate = async () => {
    try {
        console.log("Starting migration...");
        await db.query("ALTER TABLE reminders ADD COLUMN IF NOT EXISTS is_sent BOOLEAN DEFAULT FALSE;");
        console.log("Migration successful: added is_sent column to reminders");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
};

migrate();
