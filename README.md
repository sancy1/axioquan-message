# Message API

A production-grade instant messaging backend REST API for the Axioquan learning platform. Built by Alexander S. Cyril.

---

## Overview

Message API is a scalable, real-time messaging service designed for educational platforms. It provides comprehensive conversation management, real-time message delivery via WebSocket, notification systems, and robust data persistence using NeonDB PostgreSQL.

### Key Features

- **Real-time Messaging**: WebSocket-based instant message delivery with typing indicators
- **Conversation Management**: Support for direct and group conversations with course context
- **Read Receipts**: Track message delivery and read status per participant
- **Notification System**: Unread message badges and notification feed
- **Event-Driven Architecture**: Asynchronous event handling for scalable message processing
- **Background Jobs**: Automated message delivery marking and cleanup of expired messages
- **Type-Safe API**: Full TypeScript implementation with Zod validation
- **Comprehensive Testing**: Unit and integration tests with Vitest
- **Production Ready**: Docker support, rate limiting, CORS, and security headers

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Fastify** | 4.29.1 | High-performance HTTP server framework |
| **TypeScript** | 5.9.3 | Type-safe JavaScript superset |
| **NeonDB Serverless** | 0.9.5 | PostgreSQL database driver |
| **Zod** | 3.25.76 | Runtime type validation |
| **@fastify/jwt** | 8.0.1 | JWT authentication |
| **@fastify/websocket** | 10.0.1 | WebSocket support |
| **@fastify/cors** | 9.0.1 | Cross-origin resource sharing |
| **@fastify/helmet** | 11.1.1 | Security headers |
| **@fastify/rate-limit** | 9.1.0 | Rate limiting |
| **Vitest** | 1.6.1 | Testing framework |
| **Pino** | 9.14.0 | Structured logging |

---

## Architecture

The application follows a layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  Routes → Controllers → Validators → DTOs                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  Services → Events → Jobs → Business Logic                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                       Domain Layer                          │
│  Models → Interfaces → Constants → Type Definitions        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                       │
│  Repositories → Database Client → Migrations                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Cross-cutting Concerns                    │
│  Errors → Logger → Pagination → API Response               │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
src/
├── config/           # Application configuration
├── constants/        # Application constants
├── db/              # Database client and migrations
│   ├── migrations/  # SQL migration files
│   └── seeds/       # Database seed data
├── errors/          # Custom error classes and handler
├── events/          # Event emitter and listeners
├── helpers/         # Utility helper functions
├── interfaces/      # TypeScript interfaces
├── jobs/            # Background job schedulers
├── middleware/      # Request middleware
├── models/          # Domain models
├── modules/         # Feature modules
│   ├── conversations/
│   ├── messages/
│   ├── notifications/
│   ├── participants/
│   └── health/
├── plugins/         # Fastify plugins
├── types/           # Type definitions
├── utils/           # Utility functions
└── websocket/       # WebSocket handlers
```

---

## Database Schema

The application uses PostgreSQL with the following core tables:

### Conversations
```sql
CREATE TABLE conversations (
  id              UUID PRIMARY KEY,
  type            VARCHAR(20) CHECK (type IN ('direct', 'group')),
  title           VARCHAR(255),
  course_id       UUID REFERENCES courses(id),
  created_by      UUID REFERENCES users(id),
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at      TIMESTAMP WITH TIME ZONE,
  updated_at      TIMESTAMP WITH TIME ZONE
);
```

### Conversation Participants
```sql
CREATE TABLE conversation_participants (
  id              UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  user_id         UUID REFERENCES users(id),
  role            VARCHAR(20) CHECK (role IN ('student', 'instructor', 'admin')),
  joined_at       TIMESTAMP WITH TIME ZONE,
  last_read_at    TIMESTAMP WITH TIME ZONE,
  UNIQUE(conversation_id, user_id)
);
```

### Direct Messages
```sql
CREATE TABLE direct_messages (
  id              UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  sender_id       UUID REFERENCES users(id),
  message         TEXT,
  is_delivered    BOOLEAN DEFAULT false,
  delivered_at    TIMESTAMP WITH TIME ZONE,
  edited_at       TIMESTAMP WITH TIME ZONE,
  created_at      TIMESTAMP WITH TIME ZONE
);
```

### Message Read Receipts
```sql
CREATE TABLE message_read_receipts (
  id              UUID PRIMARY KEY,
  message_id      UUID REFERENCES direct_messages(id),
  user_id         UUID REFERENCES users(id),
  conversation_id UUID REFERENCES conversations(id),
  is_read         BOOLEAN DEFAULT false,
  read_at         TIMESTAMP WITH TIME ZONE,
  UNIQUE(message_id, user_id)
);
```

### Message Notifications
```sql
CREATE TABLE message_notifications (
  id              UUID PRIMARY KEY,
  user_id         UUID REFERENCES users(id),
  conversation_id UUID REFERENCES conversations(id),
  message_id      UUID REFERENCES direct_messages(id),
  sender_id       UUID REFERENCES users(id),
  is_read         BOOLEAN DEFAULT false,
  read_at         TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, message_id)
);
```

---

## API Documentation

### Base URL
- Development: `http://localhost:3001`
- Production: Configured via environment variable

### Authentication
All API endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Health Endpoints

#### Check Server Status
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "app": "messag-api",
  "environment": "development",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Check Database Connectivity
```http
GET /health/db
```

**Response:**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Conversations

#### List User Conversations
```http
GET /api/conversations
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "direct",
      "title": "Course Discussion",
      "course_id": "uuid",
      "created_by": "uuid",
      "last_message_at": "2024-01-15T10:30:00.000Z",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50
  }
}
```

#### Create Conversation
```http
POST /api/conversations
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "direct",
  "title": "Course Discussion",
  "course_id": "uuid",
  "participant_ids": ["uuid1", "uuid2"]
}
```

#### Get Conversation by ID
```http
GET /api/conversations/:id
```

#### Update Conversation
```http
PATCH /api/conversations/:id
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Title"
}
```

#### Delete Conversation
```http
DELETE /api/conversations/:id
```

### Messages

#### Get Conversation Messages
```http
GET /api/conversations/:id/messages?page=1&limit=50
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "conversation_id": "uuid",
      "sender_id": "uuid",
      "message": "Hello world",
      "is_delivered": true,
      "delivered_at": "2024-01-15T10:30:00.000Z",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100
  }
}
```

#### Send Message
```http
POST /api/conversations/:id/messages
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "Hello world"
}
```

#### Delete Message (Soft Delete)
```http
DELETE /api/messages/:id
```

### Participants

#### List Conversation Participants
```http
GET /api/conversations/:id/participants
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "conversation_id": "uuid",
      "user_id": "uuid",
      "role": "student",
      "joined_at": "2024-01-15T10:30:00.000Z",
      "last_read_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### Add Participant
```http
POST /api/conversations/:id/participants
Content-Type: application/json
```

**Request Body:**
```json
{
  "user_id": "uuid",
  "role": "student"
}
```

#### Remove Participant
```http
DELETE /api/conversations/:id/participants/:userId
```

### Notifications

#### List Unread Notifications
```http
GET /api/notifications
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "conversation_id": "uuid",
      "message_id": "uuid",
      "sender_id": "uuid",
      "is_read": false,
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### Get Unread Count
```http
GET /api/notifications/count
```

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

#### Mark Notification as Read
```http
PATCH /api/notifications/:id/read
```

#### Mark All Notifications as Read
```http
PATCH /api/notifications/read-all
```

---

## WebSocket API

### Connection
Connect to the WebSocket endpoint with a valid JWT token:

```
ws://localhost:3001/ws?token=<your-jwt-token>
```

### Events

#### Message Events
- **message**: New message received
- **delivered**: Message delivered to recipient
- **read**: Message read by recipient
- **typing**: Typing indicator
- **ping**: Keep-alive ping
- **pong**: Keep-alive pong response
- **error**: Error message
- **connected**: Connection established confirmation

#### Message Format
```json
{
  "type": "message",
  "payload": {
    "messageId": "uuid",
    "conversationId": "uuid",
    "senderId": "uuid",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Typing Indicator
```json
{
  "type": "typing",
  "payload": {
    "conversationId": "uuid",
    "isTyping": true
  }
}
```

---

## Real-time Message Flow

```
┌─────────────┐
│   Client    │
│  (Sender)   │
└──────┬──────┘
       │
       │ 1. POST /api/conversations/:id/messages
       ↓
┌─────────────┐
│   API       │
│  Endpoint   │
└──────┬──────┘
       │
       │ 2. Emit message:sent event
       ↓
┌─────────────┐
│  Event      │
│  Listener   │
└──────┬──────┘
       │
       ├─→ 3. Create notification for recipients
       ├─→ 4. Create read receipts
       └─→ 5. Push via WebSocket to recipients
              ↓
         ┌─────────────┐
         │   Client    │
         │ (Recipient) │
         └─────────────┘
```

---

## Environment Configuration

### Required Environment Variables

```bash
# Application
NODE_ENV=development
PORT=3001
APP_NAME=messag-api

# Database (NeonDB)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require&channel_binding=require

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# WebSocket
WS_ENABLED=true

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000

# Logging
LOG_LEVEL=info
```

### Setup Environment File

```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

---

## Installation

### Prerequisites
- Node.js >= 20.0.0
- npm or yarn
- Access to NeonDB PostgreSQL instance
- Valid JWT secret

### Install Dependencies

```bash
npm install
```

### Database Setup

Run database migrations:

```bash
npm run db:migrate
```

Seed development data (optional):

```bash
npm run db:seed
```

---

## Development

### Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001` with hot-reload enabled.

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

---

## Testing

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Generate Coverage Report

```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory.

### Test Structure

```
tests/
├── unit/           # Unit tests for individual functions
├── integration/    # Integration tests for API endpoints
└── setup.ts        # Test configuration and fixtures
```

---

## Build & Production

### Build for Production

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Start Production Server

```bash
npm start
```

---

## Docker Deployment

### Build Docker Image

```bash
docker build -t message-api .
```

### Run with Docker Compose

```bash
docker-compose up -d
```

### Production Docker Build

```bash
docker build --target production -t message-api:prod .
```

---

## Background Jobs

The application runs two background jobs:

### Message Delivery Marker
- **Interval**: Every 30 seconds
- **Purpose**: Marks messages as delivered after 30 seconds
- **Function**: Updates `is_delivered` and `delivered_at` fields

### Expired Message Cleanup
- **Interval**: Every 24 hours
- **Purpose**: Permanently deletes soft-deleted messages older than 30 days
- **Function**: Removes messages marked as `[Message deleted]`

---

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Configurable request rate limits per IP
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers for HTTP responses
- **Input Validation**: Zod schema validation for all inputs
- **SQL Injection Prevention**: Parameterized queries via NeonDB
- **Environment Variables**: Sensitive data stored in environment variables

---

## Error Handling

The application implements a centralized error handling strategy:

- **ValidationError**: 422 - Input validation failures
- **NotFoundError**: 404 - Resource not found
- **AppError**: Custom application errors with status codes
- **HTTP Error**: Standard HTTP errors
- **Internal Error**: 500 - Unexpected errors (stack traces in development only)

### Error Response Format

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "fields": {} // Validation errors only
  }
}
```

---

## Contributing

### Development Workflow

1. Create a feature branch from `main`
2. Make your changes with proper commit messages
3. Run tests and ensure all pass
4. Run linting and formatting
5. Submit a pull request for review

### Code Style

- Use TypeScript for all new code
- Follow existing code structure and patterns
- Write unit tests for new functions
- Update documentation as needed

---

## License

This project is proprietary software. All rights reserved.

---

## Contact

**Developer**: Alexander S. Cyril  
**Email**: alexander.s.cyril@gmail.com

For inquiries, support, or collaboration opportunities, please contact via email.

---

## Project Status

This is a production-ready messaging backend designed for the Axioquan learning platform. The API is actively maintained and updated with new features and improvements.
