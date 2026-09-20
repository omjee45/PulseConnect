/**
 * app.js — The single unified Express application.
 *
 * ARCHITECTURAL FIX:
 *   Old code ran TWO separate Express servers (server.js on :8800, chatServer.js on :8801)
 *   causing CORS issues, cookie-sharing bugs, and doubled config.
 *
 *   New: ONE http.Server, ONE Express app, ONE Socket.io instance.
 *   Auth REST API + Chat REST API + Socket.io all share the same port, cookie domain, and CORS config.
 */

const validateEnv = require('./config/validateEnv');
validateEnv(); // Crash early if env vars are missing — before any imports that need them

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler.middleware');
const initSockets = require('./sockets');

// Route imports (Step 2 & 3)
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const donorsRoutes = require('./routes/donors.routes');
const connectionsRoutes = require('./routes/connections.routes');
const conversationsRoutes = require('./routes/conversations.routes');
const adminRoutes = require('./routes/admin.routes');

// ─── Database ──────────────────────────────────────────────────────────────
// connectDB() is called in server.js before starting the server

// ─── Express app ───────────────────────────────────────────────────────────
const app = express();

// Parse allowed origins from env (supports comma-separated list for multi-origin)
const allowedOrigins = process.env.FRONTEND_URL
  .split(',')
  .map((url) => url.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // required for cross-origin cookies
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/donors', donorsRoutes);
app.use('/api/connections', connectionsRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/admin', adminRoutes);

// Health check — useful for Railway/Render uptime monitors
app.get('/health', (req, res) =>
  res.json({ success: true, message: 'PulseConnect server is healthy 🩸' })
);

// 404 handler — for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    errors: [],
  });
});

// Global error handler — MUST be the last middleware
app.use(errorHandler);

// ─── HTTP Server + Socket.io ───────────────────────────────────────────────
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Register socket auth middleware + all event handlers
initSockets(io);

module.exports = { app, httpServer, io };
