// server.js
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db'); // Your database module
const app = express();

app.use(bodyParser.json());
app.use(express.static('public')); // Frontend files

// Get all comments
app.get('/api/comments', async (req, res) => {
  try {
    const comments = await db.getComments();
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Add new comment
app.post('/api/comments', async (req, res) => {
  const { name, message } = req.body;
  
  if (!name || !message) {
    return res.status(400).json({ error: 'Name and message are required' });
  }

  try {
    const newComment = await db.addComment(name, message);
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

