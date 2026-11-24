const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// API bootstrap: configure cross-origin access and request protections before mounting marketplace endpoints.
const app = express();

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Allow CLI and server-to-server requests that do not send an Origin header.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS.'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});
app.use(express.json({ limit: '1mb' }));

app.use('/api/shop', require('./routes/shop'));
app.use('/api/auth', require('./routes/auth'));

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'Marketplace API Running' });
});

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((error, _req, res, _next) => {
  if (error.message === 'Origin is not allowed by CORS.') {
    return res.status(403).json({ message: 'Origin is not allowed.' });
  }
  if (error instanceof SyntaxError && error.status === 400) {
    return res.status(400).json({ message: 'Invalid JSON request body.' });
  }
  if (error.status === 413) {
    return res.status(413).json({ message: 'Request body is too large.' });
  }
  console.error('API error:', error.message);
  return res.status(error.status && error.status < 500 ? error.status : 500).json({
    message: error.status && error.status < 500 ? error.message : 'Internal server error',
  });
});

const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be configured with at least 32 characters.');
  process.exit(1);
}

if (!MONGO_URI) {
  console.error('MONGO_URI is required. Configure it in server/.env.');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Marketplace API listening on port ${PORT}`));
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });

module.exports = app;
