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

// Log out and log in, destroy session
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.clearCookie('connect.sid'); // Clear cookie
    res.redirect('/'); // Back to the home page
  });
});

// GET /api/owner/dogs
// Return the list of dogs belonging to the currently logged-in owner
router.get('/api/owner/dogs', async (req, res) => {
  const user = req.session.user; // Get the logged-in user from session

  if (!user || user.role !== 'owner') {
    // Only logged-in owners can access this endpoint
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Query the database for the owner's dogs
    const [rows] = await db.query(
      'SELECT dog_id, name FROM Dogs WHERE owner_id = ?',
      [user.user_id]
    );

    res.json(rows); // Return the list of dogs
  } catch (error) {
    console.error('Error fetching dogs:', error);
    res.status(500).json({ error: 'Failed to load dogs' });
  }
});

module.exports = router;