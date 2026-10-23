require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5
});

app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ message: 'API and database connection successful' });
  } catch (err) {
    console.error('Database health check failed:', err.message);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

app.post('/api/submit', async (req, res) => {
  const { name, email, feedback } = req.body;

  if (!name || !email || !feedback) {
    return res.status(400).json({
      message: 'Please fill in all fields.'
    });
  }

  try {
    await db.execute(
      'INSERT INTO feedback (name, email, feedback) VALUES (?, ?, ?)',
      [name, email, feedback]
    );

    res.json({ message: 'Feedback submitted successfully!' });
  } catch (err) {
    console.error('Feedback submission failed:', err.message);
    res.status(500).json({
      message: 'Unable to save feedback. Please try again.'
    });
  }
});

app.listen(3000, '127.0.0.1', () => {
  console.log('Feedback API running on port 3000');
});

