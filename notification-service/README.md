# Notification Service

> **MarketMind Microservices**  
> Version: 1.0.0  
> Author: Shubhajit Paul

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Message Broker Integration](#message-broker-integration)
  - [Subscribed Queues](#subscribed-queues)
  - [Message Schemas](#message-schemas)
- [Email Notifications](#email-notifications)
- [Health Check Endpoint](#health-check-endpoint)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Error Handling](#error-handling)
- [Logging](#logging)

---

## Overview

The **Notification Service** is a dedicated microservice within the MarketMind ecosystem responsible for delivering transactional notifications to users. It operates as an **event-driven consumer**, subscribing to message queues via RabbitMQ and dispatching email notifications based on business events triggered by other services (e.g., Auth Service, Order Service, Payment Service).

### Key Responsibilities

| Responsibility | Description |
|----------------|-------------|
| **Email Delivery** | Sends transactional emails using Gmail OAuth2 via Nodemailer |
| **Event Consumption** | Subscribes to RabbitMQ queues for asynchronous event processing |
| **Health Monitoring** | Exposes a health endpoint for orchestration and monitoring tools |

### Design Principles

- **Asynchronous & Decoupled**: No direct HTTP dependencies on other services; relies solely on message queues
- **Idempotent Processing**: Messages are acknowledged only after successful processing
- **Fault Tolerant**: Graceful shutdown handling with SIGINT/SIGTERM support
- **Observable**: Structured logging via Winston with file and console transports

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MarketMind Ecosystem                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                 │
│   │ Auth Service │    │Order Service │    │Payment Svc   │                 │
│   └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                 │
│          │                   │                   │                          │
│          │ publish           │ publish           │ publish                  │
│          ▼                   ▼                   ▼                          │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │                        RabbitMQ                                  │      │
│   │  ┌─────────────────────────────────────────────────────────────┐│      │
│   │  │ Queues:                                                      ││      │
│   │  │  • AUTH_NOTIFICATION.USER_CREATED                           ││      │
│   │  │  • AUTH_NOTIFICATION.PASSWORD_CHANGED                       ││      │
│   │  │  • ORDER_NOTIFICATION.ORDER_CREATED                         ││      │
│   │  │  • ORDER_NOTIFICATION.ORDER_CANCELLED                       ││      │
│   │  │  • ORDER_NOTIFICATION.ORDER_DELIVERED                       ││      │
│   │  │  • PAYMENT_NOTIFICATION.PAYMENT_SUCCESSFUL                  ││      │
│   │  │  • PAYMENT_NOTIFICATION.PAYMENT_FAILD                       ││      │
│   │  └─────────────────────────────────────────────────────────────┘│      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                    │                                        │
│                                    │ consume                                │
│                                    ▼                                        │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │                   NOTIFICATION SERVICE                           │      │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │      │
│   │  │   Broker    │─▶│  Listeners  │─▶│    Email Service        │  │      │
│   │  │ (RabbitMQ)  │  │  (Handlers) │  │    (Nodemailer/Gmail)   │  │      │
│   │  └─────────────┘  └─────────────┘  └───────────┬─────────────┘  │      │
│   └────────────────────────────────────────────────┼────────────────┘      │
│                                                    │                        │
└────────────────────────────────────────────────────┼────────────────────────┘
                                                     │ SMTP (OAuth2)
                                                     ▼
                                              ┌─────────────┐
                                              │   Gmail     │
                                              │   (SMTP)    │
                                              └─────────────┘
```

---

## Technology Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Runtime** | Node.js | ≥18.x | JavaScript runtime |
| **Framework** | Express | 5.2.1 | HTTP server for health checks |
| **Message Broker Client** | amqplib | 0.10.9 | RabbitMQ connection and messaging |
| **Email Transport** | Nodemailer | 7.0.12 | SMTP email delivery |
| **Logging** | Winston | 3.19.0 | Structured logging with file rotation |
| **Configuration** | dotenv-flow | 4.1.0 | Environment-based configuration |
| **Security** | Helmet | 8.1.0 | HTTP security headers |

---

## Message Broker Integration

The service establishes a persistent connection to RabbitMQ on startup and subscribes to multiple queues. Each queue corresponds to a specific business event.

### Connection Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `RABBIT_URL` | AMQP connection string | Required |
| Queue Durability | `durable: true` | Messages persist across broker restarts |
| Acknowledgment | Manual (`channel.ack()`) | Only after successful processing |

### Subscribed Queues

The notification service listens to the following RabbitMQ queues:

| Queue Name | Publisher | Trigger Event | Notification Type |
|------------|-----------|---------------|-------------------|
| `AUTH_NOTIFICATION.USER_CREATED` | Auth Service | User registration completed | Welcome email |
| `AUTH_NOTIFICATION.PASSWORD_CHANGED` | Auth Service | Password update successful | Security alert |
| `ORDER_NOTIFICATION.ORDER_CREATED` | Order Service | New order placed | Order confirmation |
| `ORDER_NOTIFICATION.ORDER_CANCELLED` | Order Service | Order cancellation | Cancellation notice |
| `ORDER_NOTIFICATION.ORDER_DELIVERED` | Order Service | Order delivery confirmed | Delivery confirmation |
| `PAYMENT_NOTIFICATION.PAYMENT_SUCCESSFUL` | Payment Service | Payment completed | Payment receipt |
| `PAYMENT_NOTIFICATION.PAYMENT_FAILD` | Payment Service | Payment declined/failed | Payment failure alert |

---

## Message Schemas

### AUTH_NOTIFICATION.USER_CREATED

**Description:** Triggered when a new user successfully registers on the platform.

```json
{
  "fullName": {
    "firstName": "string (required)",
    "lastName": "string (optional)"
  },
  "email": "string (required, email format)",
  "username": "string (required)"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `fullName.firstName` | string | Yes | User's first name |
| `fullName.lastName` | string | No | User's last name |
| `email` | string | Yes | Valid email format; recipient address |
| `username` | string | Yes | User's chosen username |

---

### AUTH_NOTIFICATION.PASSWORD_CHANGED

**Description:** Triggered when a user successfully changes their account password.

```json
{
  "fullName": {
    "firstName": "string (required)"
  },
  "email": "string (required, email format)"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `fullName.firstName` | string | Yes | User's first name for personalization |
| `email` | string | Yes | Valid email format; recipient address |

---

### ORDER_NOTIFICATION.ORDER_CREATED

**Description:** Triggered when a customer places a new order.

```json
{
  "orderId": "string (required)",
  "customerDetails": {
    "fullName": {
      "firstName": "string (required)",
      "lastName": "string (optional)"
    },
    "email": "string (required, email format)"
  },
  "shippingAddress": {
    "street": "string (required)",
    "landmark": "string (optional)",
    "city": "string (required)",
    "state": "string (required)",
    "country": "string (required)",
    "zip": "string (required)"
  },
  "totalPrice": {
    "currency": "string (required, e.g., 'INR', 'USD')",
    "amount": "number (required, decimal)"
  }
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `orderId` | string | Yes | Unique order identifier |
| `customerDetails.fullName.firstName` | string | Yes | Customer's first name |
| `customerDetails.fullName.lastName` | string | No | Customer's last name |
| `customerDetails.email` | string | Yes | Valid email format |
| `shippingAddress.street` | string | Yes | Street address |
| `shippingAddress.landmark` | string | No | Optional landmark |
| `shippingAddress.city` | string | Yes | City name |
| `shippingAddress.state` | string | Yes | State/Province |
| `shippingAddress.country` | string | Yes | Country name |
| `shippingAddress.zip` | string | Yes | Postal/ZIP code |
| `totalPrice.currency` | string | Yes | ISO 4217 currency code |
| `totalPrice.amount` | number | Yes | Order total (formatted to 2 decimals) |

---

### ORDER_NOTIFICATION.ORDER_CANCELLED

**Description:** Triggered when an order is cancelled by the customer or system.

```json
{
  "orderId": "string (required)",
  "fullName": {
    "firstName": "string (required)"
  },
  "email": "string (required, email format)"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `orderId` | string | Yes | Unique order identifier |
| `fullName.firstName` | string | Yes | Customer's first name |
| `email` | string | Yes | Valid email format |

---

### ORDER_NOTIFICATION.ORDER_DELIVERED

**Description:** Triggered when an order is marked as delivered.

```json
{
  "orderId": "string (required)",
  "customerDetails": {
    "fullName": {
      "firstName": "string (required)",
      "lastName": "string (optional)"
    },
    "email": "string (required, email format)"
  },
  "timestamp": "string (required, ISO 8601 format)"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `orderId` | string | Yes | Unique order identifier |
| `customerDetails.fullName.firstName` | string | Yes | Customer's first name |
| `customerDetails.email` | string | Yes | Valid email format |
| `timestamp` | string | Yes | ISO 8601 datetime of delivery |

---

### PAYMENT_NOTIFICATION.PAYMENT_SUCCESSFUL

**Description:** Triggered when a payment is successfully processed.

```json
{
  "orderId": "string (required)",
  "user": {
    "fullName": {
      "firstName": "string (optional)"
    },
    "email": "string (required, email format)"
  },
  "paymentInfo": {
    "price": {
      "amount": "number (required)",
      "currency": "string (required)"
    },
    "razorpayOrderId": "string (required)",
    "paymentId": "string (required)"
  },
  "timestamp": "string (required, ISO 8601 format)"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `orderId` | string | Yes | Associated order identifier |
| `user.fullName.firstName` | string | No | Customer's first name (defaults to "Customer") |
| `user.email` | string | Yes | Valid email format |
| `paymentInfo.price.amount` | number | Yes | Payment amount |
| `paymentInfo.price.currency` | string | Yes | ISO 4217 currency code |
| `paymentInfo.razorpayOrderId` | string | Yes | Razorpay order reference |
| `paymentInfo.paymentId` | string | Yes | Payment transaction ID |
| `timestamp` | string | Yes | ISO 8601 datetime of payment |

---

### PAYMENT_NOTIFICATION.PAYMENT_FAILD

**Description:** Triggered when a payment attempt fails.

```json
{
  "user": {
    "fullName": {
      "firstName": "string (required)"
    },
    "email": "string (required, email format)"
  },
  "paymentInfo": {
    "paymentId": "string (required)"
  },
  "timestamp": "string (required, ISO 8601 format)"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `user.fullName.firstName` | string | Yes | Customer's first name |
| `user.email` | string | Yes | Valid email format |
| `paymentInfo.paymentId` | string | Yes | Failed payment transaction ID |
| `timestamp` | string | Yes | ISO 8601 datetime of failure |

---

## Email Notifications

### Transport Configuration

The service uses **Nodemailer** with **Gmail OAuth2** authentication for secure, token-based email delivery.

| Parameter | Description |
|-----------|-------------|
| **Service** | Gmail |
| **Auth Type** | OAuth2 |
| **Sender Name** | MarketMind |
| **Support Email** | support.marketmind@gmail.com |

### Email Templates

All emails are rendered as **HTML templates** with inline CSS for maximum email client compatibility.

| Notification Type | Subject Line | Template Style |
|-------------------|--------------|----------------|
| User Created | "Welcome! Your Registration Is Complete 🎉" | Simple HTML |
| Password Changed | "Your password has been changed" | Simple HTML |
| Order Created | "Order confirmed! 🎉" | Simple HTML with list |
| Order Cancelled | "Your order has been cancelled" | Simple HTML |
| Order Delivered | "Order Delivered Successfully – Order #[ID]" | Styled HTML table |
| Payment Successful | "Payment Successful – Order #[ID]" | Styled HTML with box |
| Payment Failed | "Payment Failed" | Simple HTML with list |

---

## Health Check Endpoint

### Get Service Health

Provides real-time health metrics for the notification service and underlying system.

```
GET /api/health
```

**Authentication:** None (Public)

**Rate Limits:** No explicit rate limiting

#### Success Response

**Status Code:** `200 OK`

```json
{
  "application": {
    "environment": "PRODUCTION",
    "uptime": "3600.00 seconds",
    "memoryUsage": {
      "heapTotal": "50.25 MB",
      "heapUsed": "35.12 MB"
    }
  },
  "system": {
    "cpuUsage": [0.5, 0.75, 0.65],
    "totalMemory": "8192.00 MB",
    "usedMemory": "4096.00 MB",
    "freeMemory": "4096.00 MB"
  },
  "timestamp": 1738080000000
}
```

#### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `application.environment` | string | Current runtime environment (`DEVELOPMENT`, `PRODUCTION`, `TEST`) |
| `application.uptime` | string | Process uptime in seconds |
| `application.memoryUsage.heapTotal` | string | Total V8 heap size |
| `application.memoryUsage.heapUsed` | string | Used V8 heap size |
| `system.cpuUsage` | number[] | System load averages (1, 5, 15 minutes) |
| `system.totalMemory` | string | Total system memory |
| `system.usedMemory` | string | Used system memory |
| `system.freeMemory` | string | Available system memory |
| `timestamp` | number | Unix timestamp (milliseconds) |

---

## Configuration

### Environment Variables

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `PORT` | integer | No | `3006` | HTTP server port |
| `NODE_ENV` | string | No | `development` | Environment (`development`, `production`, `test`) |
| `SERVER_URL` | string | Yes | — | Public server URL |
| `CROSS_ORIGIN` | string | No | `http://localhost:5173` | CORS allowed origin |
| `RABBIT_URL` | string | Yes | — | RabbitMQ AMQP connection URL |
| `OAUTH_CLIENT_ID` | string | Yes | — | Google OAuth2 client ID |
| `OAUTH_CLIENT_SECRET` | string | Yes | — | Google OAuth2 client secret |
| `OAUTH_REFRESH_TOKEN` | string | Yes | — | Google OAuth2 refresh token |
| `EMAIL_USER` | string | Yes | — | Gmail address for sending emails |

### Example `.env` File

```env
PORT=3006
NODE_ENV=production
SERVER_URL=https://api.marketmind.com/notifications

RABBIT_URL=amqp://user:password@rabbitmq-host:5672

OAUTH_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
OAUTH_CLIENT_SECRET=your-google-client-secret
OAUTH_REFRESH_TOKEN=your-google-refresh-token
EMAIL_USER=noreply@marketmind.com
```

---

## Deployment

### Docker Support

The service includes Dockerfiles for both development and production environments:

| Environment | Dockerfile Path |
|-------------|-----------------|
| Development | `docker/development/Dockerfile` |
| Production | `docker/production/Dockerfile` |

### NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start with nodemon (hot reload) |
| `start` | `npm start` | Production start |
| `test` | `npm test` | Run tests (not implemented) |

### Prerequisites

1. **RabbitMQ** instance running and accessible
2. **Gmail OAuth2 credentials** configured in Google Cloud Console
3. **Node.js** version 18.x or higher

### Startup Sequence

1. Load environment configuration via `dotenv-flow`
2. Establish RabbitMQ connection
3. Create channel and subscribe to all notification queues
4. Verify Nodemailer SMTP connection
5. Start Express HTTP server
6. Register graceful shutdown handlers

---

## Error Handling

### Process-Level Error Handling

| Error Type | Handling Behavior |
|------------|-------------------|
| **Uncaught Exception** | Log error with stack trace, exit with code `1` after 1s delay |
| **Unhandled Promise Rejection** | Log rejection reason, flush logs, exit with code `1` |
| **SIGINT / SIGTERM** | Graceful shutdown: close server, allow 15s timeout, then force exit |

### RabbitMQ Error Handling

| Scenario | Behavior |
|----------|----------|
| Connection failure | Log error, exit process after 1s |
| Message processing failure | Log error, do **not** acknowledge (message requeued) |
| Successful processing | Acknowledge message (`channel.ack()`) |

### Email Sending Errors

| Scenario | Behavior |
|----------|----------|
| SMTP connection failure | Log error, exit process after 1s |
| Send failure | Log error (stack trace removed), continue processing |

---

## Logging

### Winston Configuration

The service uses **Winston** for structured logging with the following transports:

| Transport | Target | Log Levels |
|-----------|--------|------------|
| Console | stdout | All (colorized) |
| File | `logs/` directory | Filtered by level |

### Log Levels by Environment

| Environment | Minimum Level |
|-------------|---------------|
| `production` | `info` |
| `test` | `warn` |
| `development` | `debug` |

### Log Format

```
[2026-01-28T10:30:00.000Z] INFO: Server is running {"meta":{"PORT":3006,"SERVER_URL":"http://localhost:3006","ENVIRONMENT":"development"}}
```

### Log Directory

Logs are stored in the `logs/` directory at the project root. The directory is created automatically if it does not exist.

---

## Support

For issues, questions, or contributions related to the Notification Service:

- **Email:** support.marketmind@gmail.com
- **Phone:** +91 98745 61230

---

## License

ISC © Shubhajit Paul
