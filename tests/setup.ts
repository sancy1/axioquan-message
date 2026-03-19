
// tests/setup.ts

// ── Test environment setup ────────────────────────────────────────────────
// These are FAKE values used only during testing.
// Real values live in .env.local — never loaded during tests
// to prevent accidental writes to the real NeonDB database.
// If you add a new variable to .env.local, add a fake version here too.

// process.env.NODE_ENV = 'test'
// process.env.PORT = '3001'
// process.env.APP_NAME = 'messag-test'
// process.env.DATABASE_URL = 'postgresql://test:test@localhost/test'
// process.env.JWT_SECRET = 'test-secret-key-minimum-32-characters-long!!'
// process.env.JWT_EXPIRES_IN = '7d'
// process.env.CORS_ORIGIN = 'http://localhost:3000'
// process.env.WS_ENABLED = 'true'
// process.env.RATE_LIMIT_MAX = '100'
// process.env.RATE_LIMIT_WINDOW = '60000'
// process.env.LOG_LEVEL = 'silent'











import ws from 'ws'
import { neonConfig } from '@neondatabase/serverless'

// ── Environment variables ─────────────────────────────────────────────────────
process.env.NODE_ENV = 'test'
process.env.PORT = '3001'
process.env.APP_NAME = 'messag-test'

// ── Use real NeonDB for integration tests ─────────────────────────────────────
process.env.DATABASE_URL = process.env.DATABASE_URL ??
  'postgresql://neondb_owner:npg_U8q4DIVoXdpL@ep-jolly-cell-ai33uxot-pooler.c-4.us-east-1.aws.neon.tech/axio_prod?sslmode=require&channel_binding=require'

process.env.JWT_SECRET = 'test-secret-key-minimum-32-characters-long'
process.env.JWT_EXPIRES_IN = '7d'
process.env.CORS_ORIGIN = 'http://localhost:3000'
process.env.WS_ENABLED = 'true'
process.env.RATE_LIMIT_MAX = '100'
process.env.RATE_LIMIT_WINDOW = '60000'
process.env.LOG_LEVEL = 'silent'

// ── WebSocket polyfill for NeonDB in test environment ─────────────────────────
neonConfig.webSocketConstructor = ws