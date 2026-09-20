const REQUIRED_ENV_VARS = [
  'NODE_ENV',
  'PORT',
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'FRONTEND_URL',
];

function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('\n❌  STARTUP FAILED — Missing required environment variables:');
    missing.forEach((key) => console.error(`     - ${key}`));
    console.error('\n👉  Copy .env.example to .env and fill in all values.\n');
    process.exit(1);
  }

  if (process.env.JWT_SECRET.length < 32) {
    console.error('\n❌  STARTUP FAILED — JWT_SECRET is too short (minimum 32 characters).\n');
    process.exit(1);
  }

  console.log('✅  Environment variables validated.');
}

module.exports = validateEnv;
