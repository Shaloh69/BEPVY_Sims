import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "S6j4m2d9x0x069!sql",
  database: process.env.MYSQL_DATABASE || "bepvy_sims",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const userQueries = {
  createTable: `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      is_verified BOOLEAN DEFAULT FALSE,
      verification_token VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `,

  findByEmail: "SELECT * FROM users WHERE email = ?",
  findById: "SELECT * FROM users WHERE id = ?",
  create:
    "INSERT INTO users (name, email, password, verification_token) VALUES (?, ?, ?, ?)",
  updateVerificationStatus:
    "UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE verification_token = ?",
  updatePassword: "UPDATE users SET password = ? WHERE email = ?",
};

export async function initDatabase() {
  try {
    const connection = await pool.getConnection();
    await connection.query(userQueries.createTable);
    connection.release();
    console.log("Database tables initialized");
  } catch (error) {
    console.error("Failed to initialize database tables:", error);
    throw error;
  }
}

// Use this in your app.js or directly in Next.js API route
// Call this function when your server starts
// initDatabase();
