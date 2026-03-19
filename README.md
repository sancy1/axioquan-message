
# Messag API

Instant messaging backend REST API for the Axioquan learning platform.
Built with Fastify + TypeScript + NeonDB + WebSocket.

## Stack

- **Fastify 4** — HTTP server framework
- **TypeScript 5** — full type safety
- **@neondatabase/serverless** — NeonDB PostgreSQL driver
- **Zod** — request validation
- **@fastify/jwt** — JWT authentication
- **@fastify/websocket** — real-time WebSocket messaging
- **Vitest** — unit and integration testing

## Getting Started

### Prerequisites
- Node.js >= 20
- Access to the axioquan NeonDB instance

### Installation
```bash
npm install
```

### Environment Setup
```bash
cp .env.example .env.local
# Fill in your values in .env.local
```

### Development
```bash
npm run dev
```

### Testing
```bash
npm test
npm run test:coverage
```

### Database Migrations
```bash
npm run db:migrate
```

### Build
```bash
npm run build
npm start
```

## API Endpoints

### Health
- `GET /health` — server status
- `GET /health/db` — database connectivity

### Conversations
- `GET /api/conversations` — list user inbox
- `POST /api/conversations` — create conversation
- `GET /api/conversations/:id` — get single conversation
- `PATCH /api/conversations/:id` — update conversation title
- `DELETE /api/conversations/:id` — delete conversation

### Messages
- `GET /api/conversations/:id/messages` — fetch message thread
- `POST /api/conversations/:id/messages` — send message
- `DELETE /api/messages/:id` — soft delete message

### Participants
- `GET /api/conversations/:id/participants` — list participants
- `POST /api/conversations/:id/participants` — add participant
- `DELETE /api/conversations/:id/participants/:userId` — remove participant

### Notifications
- `GET /api/notifications` — list unread notifications
- `GET /api/notifications/count` — unread badge count
- `PATCH /api/notifications/:id/read` — mark single as read
- `PATCH /api/notifications/read-all` — mark all as read

### WebSocket
- `ws://host/ws?token=<jwt>` — real-time connection

## Architecture
```
Presentation  → routes · controllers · validators · DTOs
Application   → services · events · jobs
Domain        → models · interfaces · constants
Infrastructure → repositories · db client · migrations
Cross-cutting → errors · logger · pagination · apiResponse
```

## Real-time Flow
```
Student sends message via REST
  → MessageSent event fires
  → Listener creates notification + read receipt
  → WebSocket pushes to recipient instantly
```