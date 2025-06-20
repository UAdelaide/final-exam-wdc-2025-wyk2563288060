const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST a new user (simple signup)
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const [result] = await db.query(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, [username, email, password, role]);

    res.status(201).json({ message: 'User registered', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});

// POST login (dummy version)
// Verify the user name and password, and jump according to the role
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query(
      'SELECT * FROM Users WHERE username = ? AND password_hash = ?',
      [username, password] // Use the user name and password entered by the user to match
    );

    if (rows.length === 1) {
      // Save user information in session
      req.session.user = rows[0];

      // Jump to different dashboard pages according to the role
      const role = rows[0].role;
      if (role === 'owner') {
        res.redirect('/owner-dashboard.html');
      } else if (role === 'walker') {
        res.redirect('/walker-dashboard.html');
      } else {
        res.send('Unknown role'); // Handling that does not conform to the role
      }
    } else {
      res.send('Invalid username or password'); // Login failure processing
    }

  } catch (error) {
    console.error(error);
    res.status(500).send('Login failed'); // Server error handling
  }
});


module.exports = router;