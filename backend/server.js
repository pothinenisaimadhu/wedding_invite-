const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-access-key', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Wedding Invitation Backend is running');
});

// Database health check endpoint
app.get('/health', async (req, res) => {
  try {
    const isConnected = await db.validateConnection();
    if (isConnected) {
      res.json({ status: 'healthy', database: 'connected' });
    } else {
      res.status(503).json({ status: 'unhealthy', database: 'disconnected' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Config endpoint with the structure expected by the frontend
app.get('/api/v2/config', (req, res) => {
  res.json({
    code: 200,
    data: {
      app_name: "Wedding Invitation",
      app_version: "1.0.0",
      api_version: "v2",
      status: "success",
      tenor_key: "AIzaSyCWNPjm1GgTZ1GwjP3nXcVBMQCQNDt51Yw",
      can_reply: true,
      can_edit: true,
      can_delete: true,
      tz: "Asia/Kolkata",
      locale: "en",
      url: "https://wedding-invite-ll7a.onrender.com",
      comment_url: "https://wedding-invite-ll7a.onrender.com/api/v2/comment",
      greeting_url: "https://wedding-invite-ll7a.onrender.com/api/v2/greeting",
      comment_key: "bfb9cfea33ab7ae21a315fbd6f065a815d3e20ff2f007aa2ca"
    }
  });
});

// Non-versioned config endpoint
app.get('/api/config', (req, res) => {
  res.json({
    code: 200,
    data: {
      app_name: "Wedding Invitation",
      app_version: "1.0.0",
      api_version: "v2",
      status: "success",
      tenor_key: "AIzaSyCWNPjm1GgTZ1GwjP3nXcVBMQCQNDt51Yw",
      can_reply: true,
      can_edit: true,
      can_delete: true,
      tz: "Asia/Kolkata",
      locale: "en",
      url: "https://wedding-invite-ll7a.onrender.com",
      comment_url: "https://wedding-invite-ll7a.onrender.com/api/v2/comment",
      greeting_url: "https://wedding-invite-ll7a.onrender.com/api/v2/greeting",
      comment_key: "bfb9cfea33ab7ae21a315fbd6f065a815d3e20ff2f007aa2ca"
    }
  });
});

// Wedding data endpoint
app.get('/api/wedding', (req, res) => {
  res.json({
    code: 200,
    data: {
      title: "Our Wedding",
      couple: {
        male: {
          name: "Groom Name",
          fullname: "Groom Full Name",
          father: "Father of Groom",
          mother: "Mother of Groom",
          image: "./assets/images/cowo.webp"
        },
        female: {
          name: "Bride Name",
          fullname: "Bride Full Name",
          father: "Father of Bride",
          mother: "Mother of Bride",
          image: "./assets/images/cewe.webp"
        }
      },
      date: {
        akad: "2024-01-01 09:00:00",
        resepsi: "2024-01-01 10:00:00",
        countdown: "2024-01-01 09:30:00"
      },
      venue: {
        akad: "Wedding Venue",
        resepsi: "Wedding Venue",
        map: "https://maps.google.com"
      },
      status: "success"
    }
  });
});

// FIXED: V2 comment endpoint with correct response structure
app.get('/api/v2/comment', async (req, res) => {
  try {
    const comments = await db.getComments();
    const defaultComments = comments.length > 0 ? comments : [
      {
        id: 0,
        uuid: "system-welcome",
        name: "System",
        message: "Welcome to our wedding invitation! Leave your wishes here.",
        created_at: new Date().toISOString(),
        is_admin: true
      }
    ];
    
    // Return in the format expected by comment.js
    res.json({
      code: 200,
      status: "success",
      data: {
        lists: defaultComments,
        count: comments.length || 1
      }
    });
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({
      code: 500,
      status: "error",
      message: error.message || "Failed to retrieve comments"
    });
  }
});

app.post('/api/v2/comment', async (req, res) => {
  try {
    const { name, message } = req.body;
    if (!name || !message) {
      return res.status(400).json({
        code: 400,
        status: "error",
        message: 'Name and message are required'
      });
    }
    const newComment = await db.addComment(name, message);
    res.status(201).json({
      code: 201,
      status: "success",
      data: {
        ...newComment,
        uuid: `comment-${newComment.id}`,
        own: `comment-${newComment.id}`
      }
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      code: 500,
      status: "error",
      message: error.message || "Failed to add comment"
    });
  }
});

// FIXED: Greeting endpoints with correct response structure
app.get('/api/v2/greeting', async (req, res) => {
  try {
    const comments = await db.getComments();
    const defaultComments = comments.length > 0 ? comments : [
      {
        id: 0,
        uuid: "system-welcome",
        name: "System",
        message: "Welcome to our wedding invitation! Leave your wishes here.",
        created_at: new Date().toISOString(),
        is_admin: true
      }
    ];
    
    res.json({
      code: 200,
      status: "success",
      data: {
        lists: defaultComments,
        count: comments.length || 1
      }
    });
  } catch (error) {
    console.error('Error getting greetings:', error);
    res.status(500).json({
      code: 500,
      status: "error",
      message: error.message || "Failed to retrieve greetings"
    });
  }
});

app.post('/api/v2/greeting', async (req, res) => {
  try {
    const { name, message } = req.body;
    if (!name || !message) {
      return res.status(400).json({
        code: 400,
        status: "error",
        message: 'Name and message are required'
      });
    }
    const newComment = await db.addComment(name, message);
    res.status(201).json({
      code: 201,
      status: "success",
      data: {
        ...newComment,
        uuid: `greeting-${newComment.id}`,
        own: `greeting-${newComment.id}`
      }
    });
  } catch (error) {
    console.error('Error adding greeting:', error);
    res.status(500).json({
      code: 500,
      status: "error",
      message: error.message || "Failed to add greeting"
    });
  }
});

// Legacy endpoints for compatibility
app.get('/api/comments', async (req, res) => {
  try {
    const comments = await db.getComments();
    // Return just the array directly
    res.json(comments.length > 0 ? comments : [
      {
        id: 0,
        name: "System",
        message: "Welcome to our wedding invitation! Leave your wishes here.",
        created_at: new Date().toISOString()
      }
    ]);
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({ message: error.message || "Failed to retrieve comments" });
  }
});

app.post('/api/comments', async (req, res) => {
  try {
    const { name, message } = req.body;
    if (!name || !message) {
      return res.status(400).json({ message: 'Name and message are required' });
    }
    const newComment = await db.addComment(name, message);
    // Return just the comment object directly
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: error.message || "Failed to add comment" });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
