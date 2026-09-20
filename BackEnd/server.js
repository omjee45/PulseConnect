// Load env vars FIRST before anything else
require('dotenv').config();

const { httpServer } = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 8800;

async function startServer() {
  await connectDB();

  httpServer.listen(PORT, () => {
    console.log(`\n🚀 PulseConnect server running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
    console.log(`📡 CORS allowed for: ${process.env.FRONTEND_URL}\n`);
  });
}

startServer();