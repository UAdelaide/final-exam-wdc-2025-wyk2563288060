const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 8080;

app.use(express.json());

// MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'DogWalkService',
  waitForConnections: true,
  connectionLimit: 10,
});

// API: /api/dogs
app.get('/api/dogs', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT d.name AS dog_name, d.size, u.username AS owner_username
      FROM Dogs d
      JOIN Users u ON d.owner_id = u.user_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dogs', details: err.message });
  }
});

// API: /api/walkrequests/open
app.get('/api/walkrequests/open', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT wr.request_id, d.name AS dog_name, wr.requested_time,
             wr.duration_minutes, wr.location, u.username AS owner_username
      FROM WalkRequests wr
      JOIN Dogs d ON wr.dog_id = d.dog_id
      JOIN Users u ON d.owner_id = u.user_id
      WHERE wr.status = 'open'
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch open walk requests', details: err.message });
  }
});

// API: /api/walkers/summary
app.get('/api/walkers/summary', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.username AS walker_username,
             COUNT(r.rating_id) AS total_ratings,
             ROUND(AVG(r.rating), 1) AS average_rating,
             COUNT(DISTINCT wr.request_id) AS completed_walks
      FROM Users u
      LEFT JOIN WalkRatings r ON u.user_id = r.walker_id
      LEFT JOIN WalkRequests wr ON wr.request_id = r.request_id AND wr.status = 'completed'
      WHERE u.role = 'walker'
      GROUP BY u.user_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch walker summary', details: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
