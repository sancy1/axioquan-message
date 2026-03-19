
// src/config/env.ts

import { z } from 'zod'

const envSchema = z.object({
  // ── App ───────────────────────────────────────────────────────────────────
  NODE_ENV: z
    .enum(['development', 'staging', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3001),
  APP_NAME: z.string().default('messag-api'),

  // ── Database ──────────────────────────────────────────────────────────────
  DATABASE_URL: z
    .string()
    .url()
    .refine((url) => url.startsWith('postgresql://'), {
      message: 'DATABASE_URL must be a valid postgresql:// connection string',
    }),

  // ── JWT ───────────────────────────────────────────────────────────────────
  JWT_SECRET: z.string().min(32, {
    message: 'JWT_SECRET must be at least 32 characters',
  }),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // ── CORS ──────────────────────────────────────────────────────────────────
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // ── WebSocket ─────────────────────────────────────────────────────────────
  WS_ENABLED: z
    .string()
    .transform((v) => v === 'true')
    .default('true'),

  // ── Rate Limiting ─────────────────────────────────────────────────────────
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW: z.coerce.number().default(60000),

  // ── Logging ───────────────────────────────────────────────────────────────
  LOG_LEVEL: z
  .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
  .default('info'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
export type Env = typeof env