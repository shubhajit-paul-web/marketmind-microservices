# AI Buddy Service

> **Version:** 1.0.0  
> **Protocol:** WebSocket (Socket.IO)  
> **LLM Backend:** Google Gemini 2.5 Flash via LangChain/LangGraph

A real-time conversational AI agent microservice for the MarketMind e-commerce platform. This service provides intelligent product search and cart management capabilities through natural language interactions over WebSocket connections.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Authentication](#authentication)
- [WebSocket Connection](#websocket-connection)
- [Socket Events](#socket-events)
- [AI Agent Tools](#ai-agent-tools)
- [HTTP Endpoints](#http-endpoints)
- [Error Handling](#error-handling)
- [Configuration](#configuration)
- [Rate Limits & Quotas](#rate-limits--quotas)
- [Examples](#examples)

---

## Overview

The AI Buddy Service is a stateless, real-time conversational AI microservice that enables users to interact with the MarketMind e-commerce platform using natural language. Built on LangChain and LangGraph, the agent can autonomously decide when to invoke tools for product search and cart operations.

### Key Capabilities

| Capability | Description |
|------------|-------------|
| **Product Search** | Natural language product discovery (e.g., "Find me wireless headphones under $100") |
| **Cart Management** | Add products to cart via conversational commands |
| **Context-Aware** | Maintains conversation context within a session |
| **Tool Calling** | Autonomous tool invocation based on user intent |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            AI Buddy Service                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌──────────────────┐    ┌──────────────────────────┐  │
│  │   Socket.IO  │───▶│   LangGraph      │───▶│   Google Gemini 2.5      │  │
│  │   Server     │    │   Agent          │    │   Flash (LLM)            │  │
│  └──────────────┘    └──────────────────┘    └──────────────────────────┘  │
│         │                    │                                              │
│         │                    ▼                                              │
│         │            ┌──────────────────┐                                   │
│         │            │   Agent Tools    │                                   │
│         │            │  ┌────────────┐  │                                   │
│         │            │  │searchProd- │  │──────▶ Product Service API       │
│         │            │  │ucts        │  │                                   │
│         │            │  ├────────────┤  │                                   │
│         │            │  │addProduct- │  │──────▶ Cart Service API          │
│         │            │  │ToCart      │  │                                   │
│         │            │  └────────────┘  │                                   │
│         │            └──────────────────┘                                   │
│         ▼                                                                   │
│  ┌──────────────┐                                                           │
│  │    Redis     │◀── Token Blacklist Validation                            │
│  └──────────────┘                                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Agent State Graph

```
          ┌─────────┐
          │ __start__│
          └────┬────┘
               │
               ▼
          ┌─────────┐
     ┌───▶│  chat   │◀───┐
     │    └────┬────┘    │
     │         │         │
     │    tool_calls?    │
     │    ┌────┴────┐    │
     │    │         │    │
     │   Yes        No   │
     │    │         │    │
     │    ▼         ▼    │
     │ ┌──────┐  ┌──────┐│
     └─┤tools │  │__end__││
       └──────┘  └───────┘
```

---

## Authentication

### Method: JWT Bearer Token

All WebSocket connections require authentication via JWT access tokens. The service supports two token delivery mechanisms:

| Delivery Method | Format | Priority |
|-----------------|--------|----------|
| **HTTP Cookie** | `accessToken=<jwt_token>` | Primary |
| **Authorization Header** | `Authorization: Bearer <jwt_token>` | Fallback |

### Token Requirements

| Field | Type | Constraint | Description |
|-------|------|------------|-------------|
| `_id` | `string` | Required | User's unique identifier |
| `role` | `string` | Required, must equal `"user"` | User role for RBAC |

### Token Validation Flow

1. Extract token from cookie or Authorization header
2. Check token against Redis blacklist (`blacklist:<token>`)
3. Verify JWT signature using `ACCESS_TOKEN_SECRET`
4. Validate `role === "user"` for authorization
5. Attach decoded payload to socket instance

### Authentication Errors

| Error Message | Cause | Resolution |
|---------------|-------|------------|
| `Access token not found, please login again` | No token provided in cookies or headers | Include valid JWT in request |
| `Token has been invalidated, please login again` | Token exists in Redis blacklist | Re-authenticate to obtain new token |
| `Invalid access token` | JWT verification failed (expired/malformed) | Obtain fresh token via login |
| `Unauthorized access` | Token role is not `"user"` | Ensure user has correct role assigned |

---

## WebSocket Connection

### Connection URL

```
ws://<host>:<port>/
wss://<host>:<port>/  (production)
```

**Default Port:** `3005`

### CORS Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `origin` | `http://localhost:5173` | Allowed origin for WebSocket connections |
| `credentials` | `true` | Enables cookie transmission |

### Client Connection Example (JavaScript)

```javascript
import { io } from "socket.io-client";

const socket = io("ws://localhost:3005", {
  withCredentials: true,
  // OR using Authorization header:
  // extraHeaders: {
  //   Authorization: "Bearer <your_jwt_token>"
  // }
});

socket.on("connect", () => {
  console.log("Connected to AI Buddy Service");
});

socket.on("connect_error", (error) => {
  console.error("Connection failed:", error.message);
});
```

### Connection Lifecycle Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `connect` | Server → Client | Successful connection established |
| `connect_error` | Server → Client | Connection/authentication failed |
| `disconnect` | Bidirectional | Connection terminated |

---

## Socket Events

### Client → Server Events

#### `client-message`

Send a natural language message to the AI agent for processing.

**Event Name:** `client-message`

**Payload:**

| Parameter | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| `prompt` | `string` | Yes | Non-empty after trim | Natural language message/query |

**Example:**

```javascript
socket.emit("client-message", "Find me some wireless headphones");
```

**Behavior:**
1. Message is trimmed and validated
2. Passed to LangGraph agent with user context
3. Agent determines if tool calls are needed
4. Final response emitted via `agent-response` event

---

### Server → Client Events

#### `agent-response`

Receives the AI agent's response after processing the user's message.

**Event Name:** `agent-response`

**Payload:**

| Field | Type | Description |
|-------|------|-------------|
| `response` | `string` | Agent's natural language response (trimmed) |

**Example Response:**

```javascript
socket.on("agent-response", (response) => {
  console.log("Agent:", response);
  // "I found 5 wireless headphones for you. Here are the top options:
  //  1. Sony WH-1000XM5 - $348
  //  2. Apple AirPods Max - $449
  //  ..."
});
```

---

## AI Agent Tools

The AI agent has access to the following tools, which it invokes autonomously based on user intent.

### Tool: `searchProducts`

Search the product catalog using natural language queries.

**Tool Name:** `searchProducts`

**Invocation Trigger:** User expresses intent to find, search, browse, or discover products.

#### Input Schema

| Parameter | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| `query` | `string` | Yes | Trimmed, non-empty | Search query for products |

#### Internal Behavior

```
POST ${PRODUCT_SERVICE_API}?search=<query>
Authorization: Bearer <user_access_token>
```

#### Output

Returns JSON-stringified array of product objects from the Product Service.

**Success Response Structure:**

```json
[
  {
    "id": "prod_abc123",
    "name": "Sony WH-1000XM5",
    "price": 348.00,
    "category": "Electronics",
    "description": "Premium noise-canceling wireless headphones"
  }
]
```

**Error Response:**

```
"Something went wrong. Please try again."
```

#### Example Triggers

| User Input | Tool Invoked |
|------------|--------------|
| "Find wireless headphones" | ✅ `searchProducts({ query: "wireless headphones" })` |
| "Show me running shoes" | ✅ `searchProducts({ query: "running shoes" })` |
| "What laptops do you have?" | ✅ `searchProducts({ query: "laptops" })` |
| "Add this to my cart" | ❌ Not triggered |

---

### Tool: `addProductToCart`

Add a product to the authenticated user's shopping cart.

**Tool Name:** `addProductToCart`

**Invocation Trigger:** User expresses intent to add a specific product to their cart.

#### Input Schema

| Parameter | Type | Required | Default | Constraints | Description |
|-----------|------|----------|---------|-------------|-------------|
| `productId` | `string` | Yes | — | Trimmed, valid product ID | The ID of the product to add |
| `quantity` | `number` | No | `1` | Positive integer | Quantity to add |

#### Internal Behavior

```
POST ${CART_SERVICE_API}/items
Authorization: Bearer <user_access_token>
Content-Type: application/json

{
  "productId": "<product_id>",
  "qty": <quantity>
}
```

#### Output

**Success Response:**

```
"Added product with id prod_abc123 (qty: 2) to cart."
```

**Error Response:**

```
"Something went wrong. Please try again."
```

#### Example Triggers

| User Input | Tool Invoked |
|------------|--------------|
| "Add the Sony headphones to my cart" | ✅ `addProductToCart({ productId: "...", quantity: 1 })` |
| "I want 3 of those" | ✅ `addProductToCart({ productId: "...", quantity: 3 })` |
| "Put it in my basket" | ✅ `addProductToCart({ productId: "...", quantity: 1 })` |
| "What's in my cart?" | ❌ Not triggered (tool not available) |

---

## HTTP Endpoints

### Health Check

Monitor the service's health status and resource utilization.

**Endpoint:** `GET /api/health`

**Authentication:** None (Public)

**Rate Limit:** Standard (no specific limits)

#### Response

**Status:** `200 OK`

```json
{
  "application": {
    "environment": "PRODUCTION",
    "uptime": "3600.00 seconds",
    "memoryUsage": {
      "heapTotal": "64.00 MB",
      "heapUsed": "32.50 MB"
    }
  },
  "system": {
    "cpuUsage": [0.5, 0.75, 0.6],
    "totalMemory": "16384.00 MB",
    "usedMemory": "8192.00 MB",
    "freeMemory": "8192.00 MB"
  },
  "timestamp": 1738051200000
}
```

#### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `application.environment` | `string` | Current runtime environment (DEVELOPMENT/PRODUCTION) |
| `application.uptime` | `string` | Process uptime in seconds |
| `application.memoryUsage.heapTotal` | `string` | Total V8 heap size |
| `application.memoryUsage.heapUsed` | `string` | Used V8 heap size |
| `system.cpuUsage` | `number[]` | System load averages (1, 5, 15 minutes) |
| `system.totalMemory` | `string` | Total system memory |
| `system.usedMemory` | `string` | Used system memory |
| `system.freeMemory` | `string` | Free system memory |
| `timestamp` | `number` | Unix timestamp (milliseconds) |

---

## Error Handling

### WebSocket Connection Errors

| Error Code | Error Message | Description | Client Action |
|------------|---------------|-------------|---------------|
| — | `Access token not found, please login again` | Missing authentication token | Redirect to login |
| — | `Token has been invalidated, please login again` | Token is blacklisted | Re-authenticate |
| — | `Invalid access token` | JWT verification failed | Obtain new token |
| — | `Unauthorized access` | Insufficient permissions | Contact support |

### Agent Processing Errors

When the agent encounters an error during message processing, it returns a graceful fallback response:

```
"I apologize, but I'm unable to process your request at the moment. 
Please try again or contact support if the issue persists"
```

### Tool Execution Errors

Tool failures are handled gracefully and return user-friendly messages:

| Tool | Error Response |
|------|----------------|
| `searchProducts` | `"Something went wrong. Please try again."` |
| `addProductToCart` | `"Something went wrong. Please try again."` |

---

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3005` | HTTP/WebSocket server port |
| `NODE_ENV` | No | `development` | Runtime environment |
| `SERVER_URL` | Yes | — | Public server URL |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Allowed CORS origin |
| `ACCESS_TOKEN_SECRET` | Yes | — | JWT signing secret |
| `REDIS_HOST` | Yes | — | Redis server hostname |
| `REDIS_PORT` | Yes | — | Redis server port |
| `REDIS_PASSWORD` | Yes | — | Redis authentication password |
| `GEMINI_API_KEY` | Yes | — | Google Gemini API key |
| `CART_SERVICE_API` | Yes | — | Cart microservice base URL |
| `PRODUCT_SERVICE_API` | Yes | — | Product microservice base URL |

### Example `.env` Configuration

```env
PORT=3005
NODE_ENV=production
SERVER_URL=https://api.marketmind.com
CORS_ORIGIN=https://marketmind.com

ACCESS_TOKEN_SECRET=your-super-secret-jwt-key

REDIS_HOST=redis.internal
REDIS_PORT=6379
REDIS_PASSWORD=redis-password

GEMINI_API_KEY=your-gemini-api-key

CART_SERVICE_API=http://cart-service:3002/api/v1/carts
PRODUCT_SERVICE_API=http://product-service:3001/api/v1/products
```

---

## Rate Limits & Quotas

### Service-Level Limits

| Resource | Limit | Window | Notes |
|----------|-------|--------|-------|
| WebSocket Connections | Per user infrastructure | — | Limited by server capacity |
| Messages per Connection | No hard limit | — | Subject to LLM rate limits |

### External Dependencies

| Dependency | Rate Limit | Notes |
|------------|------------|-------|
| Google Gemini API | Per API key quota | Configured with `maxRetries: 5` |
| Product Service | Service-defined | Inherits user's rate limit |
| Cart Service | Service-defined | Inherits user's rate limit |

---

## Examples

### Complete Client Integration

```javascript
import { io } from "socket.io-client";

class AIBuddyClient {
  constructor(serverUrl, options = {}) {
    this.socket = io(serverUrl, {
      withCredentials: true,
      ...options
    });
    
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.socket.on("connect", () => {
      console.log("✅ Connected to AI Buddy");
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Connection error:", error.message);
      // Handle authentication errors
      if (error.message.includes("token")) {
        this.handleAuthError();
      }
    });

    this.socket.on("agent-response", (response) => {
      console.log("🤖 Agent:", response);
      this.onResponse?.(response);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("🔌 Disconnected:", reason);
    });
  }

  sendMessage(message) {
    if (!this.socket.connected) {
      throw new Error("Not connected to AI Buddy");
    }
    this.socket.emit("client-message", message);
  }

  onResponse(callback) {
    this.onResponse = callback;
  }

  handleAuthError() {
    // Implement your auth refresh logic
    window.location.href = "/login";
  }

  disconnect() {
    this.socket.disconnect();
  }
}

// Usage
const buddy = new AIBuddyClient("wss://api.marketmind.com");

buddy.onResponse((response) => {
  displayMessage(response);
});

// Send a message
buddy.sendMessage("Show me the latest smartphones under $500");
```

### Conversation Flow Example

```
User: "I'm looking for running shoes"
Agent: "I found several running shoes for you! Here are some options:
        1. Nike Air Zoom Pegasus 40 - $130
        2. Adidas Ultraboost 23 - $190
        3. ASICS Gel-Kayano 30 - $160
        Would you like me to add any of these to your cart?"

User: "Add the Nike ones to my cart"
Agent: "Done! I've added the Nike Air Zoom Pegasus 40 to your cart. 
        Would you like to continue shopping or proceed to checkout?"

User: "Actually, add 2 of them"
Agent: "I've updated your cart with 2 Nike Air Zoom Pegasus 40 shoes. 
        Your cart total is now $260."
```

---

## Logging

The service uses Winston for structured logging with environment-aware log levels:

| Environment | Log Level |
|-------------|-----------|
| `development` | `debug` |
| `test` | `warn` |
| `production` | `info` |

Logs are written to:
- Console (with colorized output)
- `logs/` directory (file-based persistence)

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@langchain/core` | ^1.1.9 | LangChain core utilities |
| `@langchain/google-genai` | ^2.1.4 | Google Gemini integration |
| `@langchain/langgraph` | ^1.0.7 | Agent state graph management |
| `socket.io` | ^4.8.3 | WebSocket server |
| `ioredis` | ^5.8.2 | Redis client |
| `jsonwebtoken` | ^9.0.3 | JWT authentication |
| `express` | ^5.2.1 | HTTP server (health endpoint) |
| `winston` | ^3.19.0 | Logging |

---

## Docker Deployment

### Development

```bash
docker build -f docker/development/Dockerfile -t ai-buddy-service:dev .
docker run -p 3005:3005 --env-file .env ai-buddy-service:dev
```

### Production

```bash
docker build -f docker/production/Dockerfile -t ai-buddy-service:prod .
docker run -p 3005:3005 --env-file .env.production ai-buddy-service:prod
```

---

## Support

For issues or questions regarding the AI Buddy Service, please contact the MarketMind platform team.

---

**License:** ISC
