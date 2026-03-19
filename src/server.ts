
// // // src/server.ts

// import Fastify from 'fastify'
// import { appConfig } from './config/app.js'
// import { env } from './config/env.js'
// import { testDatabaseConnection } from './db/client.js'
// import { errorHandler } from './errors/errorHandler.js'
// import jwtPlugin from './plugins/jwt.plugin.js'
// import corsPlugin from './plugins/cors.plugin.js'
// import rateLimitPlugin from './plugins/rateLimit.plugin.js'
// import websocketPlugin from './plugins/websocket.plugin.js'
// import { registerRequestLogger } from './middleware/requestLogger.js'
// import { conversationRoutes } from './modules/conversations/conversation.routes.js'
// import { messageRoutes, messageDeleteRoutes } from './modules/messages/message.routes.js'
// import { participantRoutes } from './modules/participants/participant.routes.js'
// import { notificationRoutes } from './modules/notifications/notification.routes.js'
// import { startMarkDeliveredJob } from './jobs/markDelivered.job.js'
// import { startCleanupExpiredJob } from './jobs/cleanupExpired.job.js'

// // Register event listeners — must be imported to activate
// import './events/message.listener.js'


// // ── BuildUp ─────────────────────────────────────────────────────────────────
// async function buildApp() {
//   const app = Fastify(appConfig.fastify)

//   // ── Security plugins ──────────────────────────────────────────────────────
//   await app.register(corsPlugin)
//   await app.register(rateLimitPlugin)
//   await app.register(jwtPlugin)
//   await app.register(websocketPlugin)

//   // ── Request logging ───────────────────────────────────────────────────────
//   registerRequestLogger(app)

//   // ── Health check ──────────────────────────────────────────────────────────
//   app.get('/health', async () => ({
//     status: 'ok',
//     app: env.APP_NAME,
//     environment: env.NODE_ENV,
//     timestamp: new Date().toISOString(),
//   }))

//   // ── API Routes ────────────────────────────────────────────────────────────
//   await app.register(conversationRoutes, { prefix: '/api/conversations' })
  
//   // Messages nested under conversations
//   await app.register(messageRoutes, { prefix: '/api/conversations' })

//   // Message delete uses separate prefix
//   await app.register(messageDeleteRoutes, { prefix: '/api/messages' })

//   await app.register(participantRoutes, { prefix: '/api/conversations' })

//   await app.register(notificationRoutes, { prefix: '/api/notifications' })

//   // ── Global error handler ──────────────────────────────────────────────────
//   app.setErrorHandler(errorHandler)

//   return app
// }

// // ── Start ─────────────────────────────────────────────────────────────────────
// async function start() {
//   try {
//     await testDatabaseConnection()
//     const app = await buildApp()
//     await app.listen(appConfig.server)
//     console.log(
//       `🚀 ${env.APP_NAME} running on port ${env.PORT} [${env.NODE_ENV}]`
//     )
//   } catch (error) {
//     console.error('❌ Server failed to start:', error)
//     process.exit(1)
//   }
// }

// start()

























// // src/server.ts

import Fastify from 'fastify'
import { appConfig } from './config/app.js'
import { env } from './config/env.js'
import { testDatabaseConnection } from './db/client.js'
import { errorHandler } from './errors/errorHandler.js'
import jwtPlugin from './plugins/jwt.plugin.js'
import corsPlugin from './plugins/cors.plugin.js'
import rateLimitPlugin from './plugins/rateLimit.plugin.js'
import websocketPlugin from './plugins/websocket.plugin.js'
import { registerRequestLogger } from './middleware/requestLogger.js'
import { conversationRoutes } from './modules/conversations/conversation.routes.js'
import { messageRoutes, messageDeleteRoutes } from './modules/messages/message.routes.js'
import { participantRoutes } from './modules/participants/participant.routes.js'
import { notificationRoutes } from './modules/notifications/notification.routes.js'
import { startMarkDeliveredJob } from './jobs/markDelivered.job.js'
import { startCleanupExpiredJob } from './jobs/cleanupExpired.job.js'
import { registerWebSocketHandler } from './websocket/websocket.handler.js'
import { healthRoutes } from './modules/health/health.routes.js'

// Register event listeners — must be imported to activate
import './events/message.listener.js'


// ── BuildUp ─────────────────────────────────────────────────────────────────
async function buildApp() {
  const app = Fastify(appConfig.fastify)

  // ── Security plugins ────────────────────────────────────────────────────────
  await app.register(corsPlugin)
  await app.register(rateLimitPlugin)
  await app.register(jwtPlugin)
  await app.register(websocketPlugin)

  // ── Request logging ─────────────────────────────────────────────────────────
  registerRequestLogger(app)

  // ── Health check ────────────────────────────────────────────────────────────
 await app.register(healthRoutes)

  // ── TEMP: Token generator for testing — REMOVE before production ────────────
  // app.post('/dev/token', async (request, reply) => {
  //   const body = request.body as {
  //     userId: string
  //     email: string
  //     role: string
  //   }
  //   const token = app.jwt.sign({
  //     userId: body.userId,
  //     email: body.email,
  //     role: body.role,
  //   })
  //   reply.send({ token })
  // })

  // ── API Routes ──────────────────────────────────────────────────────────────
  await app.register(conversationRoutes, { prefix: '/api/conversations' })
  await app.register(messageRoutes, { prefix: '/api/conversations' })
  await app.register(messageDeleteRoutes, { prefix: '/api/messages' })
  await app.register(participantRoutes, { prefix: '/api/conversations' })
  await app.register(notificationRoutes, { prefix: '/api/notifications' })
  await registerWebSocketHandler(app)

  // ── Global error handler ────────────────────────────────────────────────────
  app.setErrorHandler(errorHandler)

  return app
}

async function start() {
  try {
    await testDatabaseConnection()

    const app = await buildApp()

    await app.listen(appConfig.server)

    // ── Start background jobs ─────────────────────────────────────────────────
    startMarkDeliveredJob()
    startCleanupExpiredJob()

    console.log(
      `🚀 ${env.APP_NAME} running on port ${env.PORT} [${env.NODE_ENV}]`
    )
  } catch (error) {
    console.error('❌ Server failed to start:', error)
    process.exit(1)
  }
}

start()