# Cart Service API Documentation

**Version:** 1.0.0  
**Base URL:** `/api/v1`  
**Protocol:** HTTP/HTTPS  
**Content-Type:** `application/json`

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Rate Limiting](#rate-limiting)
4. [Common Response Format](#common-response-format)
5. [Error Handling](#error-handling)
6. [API Endpoints](#api-endpoints)
   - [Health Check](#1-health-check)
   - [Get Cart](#2-get-cart)
   - [Add Item to Cart](#3-add-item-to-cart)
   - [Update Item Quantity](#4-update-item-quantity)

---

## Overview

The Cart Service is a microservice responsible for managing user shopping carts in the MarketMind e-commerce platform. It provides RESTful endpoints for viewing, adding items, and updating quantities within a user's cart.

**Key Features:**
- User-specific cart management
- Automatic cart creation on first access
- Quantity updates (including removal via quantity 0)
- JWT-based authentication
- Real-time cart totals calculation

---

## Authentication

All cart endpoints (except health check) require **JWT-based authentication** using Bearer tokens.

### Authentication Method

**Type:** Bearer Token  
**Header:** `Authorization: Bearer <access_token>`  
**Alternative:** `accessToken` cookie

### Token Requirements

- **Algorithm:** JWT (HS256)
- **Required Claims:**
  - `_id` (string) - User ID
  - `role` (string) - Must be `"user"`
  - `exp` (number) - Expiration timestamp
- **Token Lifetime:** Configured via `JWT.ACCESS_TOKEN_SECRET` environment variable

### Obtaining Tokens

Tokens are issued by the Authentication Service (not covered in this documentation). Contact the auth service documentation for login/registration endpoints.

---

## Rate Limiting

**Standard Rate Limit:** 100 requests per minute per IP address  
**Burst Limit:** 10 requests per second  

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1643723400
```

**Exceeded Rate Limit Response:**
```json
{
  "success": false,
  "statusCode": 429,
  "message": "Too many requests! Please try again after some time",
  "errorCode": "RATE_LIMIT_EXCEEDED"
}
```

---

## Common Response Format

All API responses follow a standardized format for consistency.

### Success Response Structure

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Human-readable success message",
  "data": { /* Response payload */ },
  "meta": { /* Optional metadata (e.g., pagination) */ }
}
```

### Error Response Structure

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Human-readable error message",
  "errorCode": "ERROR_CODE_IDENTIFIER",
  "details": { /* Optional error details */ }
}
```

---

## Error Handling

### Standard Error Codes

| HTTP Status | Error Code | Message | Cause |
|------------|------------|---------|-------|
| 400 | `VALIDATION_ERROR` | Validation failed | Invalid request parameters or body |
| 401 | `MISSING_TOKEN` | Access token not found, please login again | No authentication token provided |
| 401 | `INVALID_TOKEN` | Invalid authentication token | Malformed or corrupted JWT |
| 401 | `EXPIRED_TOKEN` | Token expired, please login again | JWT expiration time has passed |
| 401 | `BLACKLISTED_TOKEN` | Token has been invalidated, please login again | User logged out / token revoked |
| 403 | `INSUFFICIENT_PERMISSIONS` | You don't have permission to access this resource | User role does not match required role |
| 404 | `ITEM_NOT_FOUND` | Item not found | Requested product does not exist in cart |
| 500 | `INTERNAL_SERVER_ERROR` | Something went wrong! | Unexpected server error |

### Validation Error Example

When request validation fails, detailed field-level errors are returned:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "details": {
    "errors": [
      {
        "field": "productId",
        "message": "Invalid product ID",
        "value": "invalid-id-format"
      },
      {
        "field": "qty",
        "message": "Quantity must be a positive integer",
        "value": -5
      }
    ]
  }
}
```

---

## API Endpoints

---

## 1. Health Check

**Description:** Checks the operational status of the Cart Service, including application and system health metrics. This endpoint is used by monitoring systems and load balancers.

**Why Use This:** Verify service availability before making business-critical requests, monitor service uptime, and gather system metrics for observability.

### Endpoint Details

```
GET /api/v1/health
```

**Authentication:** None (Public)  
**Rate Limit:** Excluded from standard rate limiting

### Request

**Headers:** None required

**Query Parameters:** None

**Request Body:** None

### Response

#### Success Response (200 OK)

```json
{
  "application": {
    "name": "cart-service",
    "version": "1.0.0",
    "environment": "production",
    "uptime": 3600000,
    "status": "healthy"
  },
  "system": {
    "platform": "linux",
    "nodeVersion": "v20.10.0",
    "memory": {
      "total": 8589934592,
      "free": 4294967296,
      "used": 4294967296,
      "usagePercentage": 50.00
    },
    "cpu": {
      "model": "Intel(R) Xeon(R) CPU @ 2.50GHz",
      "cores": 4,
      "loadAverage": [1.5, 1.8, 2.0]
    }
  },
  "timestamp": 1643723400000
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `application.name` | string | Service name identifier |
| `application.version` | string | Current service version from package.json |
| `application.environment` | string | Runtime environment (development/production) |
| `application.uptime` | number | Time in milliseconds since service started |
| `application.status` | string | Overall health status (`healthy`/`degraded`/`unhealthy`) |
| `system.platform` | string | Operating system platform |
| `system.nodeVersion` | string | Node.js runtime version |
| `system.memory.total` | number | Total system memory in bytes |
| `system.memory.free` | number | Available memory in bytes |
| `system.memory.used` | number | Used memory in bytes |
| `system.memory.usagePercentage` | number | Memory usage percentage (0-100) |
| `system.cpu.model` | string | CPU model name |
| `system.cpu.cores` | number | Number of CPU cores |
| `system.cpu.loadAverage` | number[] | System load average [1min, 5min, 15min] |
| `timestamp` | number | Unix timestamp (milliseconds) of the response |

#### Error Responses

| Status | Scenario | Response |
|--------|----------|----------|
| 503 | Service Unavailable | Database connection failure or critical dependencies down |

**503 Service Unavailable Example:**

```json
{
  "success": false,
  "statusCode": 503,
  "message": "Service temporarily unavailable",
  "errorCode": "SERVICE_UNAVAILABLE",
  "details": {
    "database": "disconnected",
    "redis": "connected"
  }
}
```

---

## 2. Get Cart

**Description:** Retrieves the complete shopping cart for the authenticated user, including all items, quantities, and calculated totals. If the user does not have an existing cart, an empty cart is automatically created and returned.

**Why Use This:** Display cart contents on cart pages, checkout flows, or navigation badges showing item counts.

### Endpoint Details

```
GET /api/v1/cart
```

**Authentication:** Required (Bearer Token)  
**Required Role:** `user`  
**Rate Limit:** 100 requests/minute

### Request

**Headers:**

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token: `Bearer <access_token>` |

**Query Parameters:** None

**Request Body:** None

### Response

#### Success Response (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Cart fetched successfully",
  "data": {
    "cart": {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f191e810c19729de860ea",
      "items": [
        {
          "productId": "65a8f4d3e1234567890abcde",
          "quantity": 3,
          "_id": "65a8f4d3e1234567890abcdf"
        },
        {
          "productId": "65a8f4d3e1234567890abce0",
          "quantity": 1,
          "_id": "65a8f4d3e1234567890abce1"
        }
      ],
      "createdAt": "2026-01-20T10:30:00.000Z",
      "updatedAt": "2026-01-28T14:22:00.000Z"
    },
    "totals": {
      "itemCount": 2,
      "totalQuantity": 4
    }
  }
}
```

**Empty Cart Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Cart fetched successfully",
  "data": {
    "cart": {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f191e810c19729de860ea",
      "items": [],
      "createdAt": "2026-01-28T14:22:00.000Z",
      "updatedAt": "2026-01-28T14:22:00.000Z"
    },
    "totals": {
      "itemCount": 0,
      "totalQuantity": 0
    }
  }
}
```

**Response Fields:**

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `data.cart._id` | string | Unique cart identifier (MongoDB ObjectId) | 24-character hex string |
| `data.cart.userId` | string | Owner's user ID (MongoDB ObjectId) | 24-character hex string |
| `data.cart.items` | array | List of cart items | Empty array if no items |
| `data.cart.items[].productId` | string | Product identifier (MongoDB ObjectId) | 24-character hex string |
| `data.cart.items[].quantity` | number | Item quantity in cart | Integer, min: 1 |
| `data.cart.items[]._id` | string | Cart item entry ID (MongoDB ObjectId) | 24-character hex string |
| `data.cart.createdAt` | string | Cart creation timestamp | ISO 8601 datetime |
| `data.cart.updatedAt` | string | Last cart modification timestamp | ISO 8601 datetime |
| `data.totals.itemCount` | number | Total number of distinct products | Integer, min: 0 |
| `data.totals.totalQuantity` | number | Sum of all item quantities | Integer, min: 0 |

#### Error Responses

| Status Code | Error Code | Message | Cause |
|------------|------------|---------|-------|
| 401 | `MISSING_TOKEN` | Access token not found, please login again | No Authorization header or cookie |
| 401 | `INVALID_TOKEN` | Invalid authentication token | Malformed JWT |
| 401 | `EXPIRED_TOKEN` | Token expired, please login again | JWT exp claim has passed |
| 401 | `BLACKLISTED_TOKEN` | Token has been invalidated, please login again | User logged out |
| 403 | `INSUFFICIENT_PERMISSIONS` | You don't have permission to access this resource | User role is not 'user' |
| 500 | `INTERNAL_SERVER_ERROR` | Something went wrong! | Database connection issue or unexpected error |

**401 Unauthorized Example:**

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Access token not found, please login again",
  "errorCode": "MISSING_TOKEN"
}
```

---

## 3. Add Item to Cart

**Description:** Adds a new product to the authenticated user's cart or increments the quantity if the product already exists. The quantity specified is added to the existing quantity (cumulative behavior).

**Why Use This:** Implement "Add to Cart" functionality on product pages, quick-add buttons, or bulk import features.

### Endpoint Details

```
POST /api/v1/cart/items
```

**Authentication:** Required (Bearer Token)  
**Required Role:** `user`  
**Rate Limit:** 100 requests/minute

### Request

**Headers:**

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token: `Bearer <access_token>` |
| `Content-Type` | string | Yes | Must be `application/json` |

**Query Parameters:** None

**Request Body:**

```json
{
  "productId": "65a8f4d3e1234567890abcde",
  "qty": 2
}
```

**Body Parameters:**

| Field | Type | Required | Default | Description | Validation |
|-------|------|----------|---------|-------------|------------|
| `productId` | string | Yes | - | MongoDB ObjectId of the product to add | Must be valid 24-character hex ObjectId |
| `qty` | number | No | 1 | Quantity to add to cart | Integer, min: 1 |

**Constraints:**
- `productId`: Must match format `/^[0-9a-fA-F]{24}$/`
- `qty`: Positive integer only; decimals and negative values are rejected

### Response

#### Success Response (200 OK)

**Case 1: New Item Added**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Item added to cart",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "items": [
      {
        "productId": "65a8f4d3e1234567890abcde",
        "quantity": 2,
        "_id": "65a8f4d3e1234567890abcdf"
      }
    ],
    "createdAt": "2026-01-20T10:30:00.000Z",
    "updatedAt": "2026-01-28T14:25:00.000Z"
  }
}
```

**Case 2: Existing Item Quantity Increased**

If the product already exists in the cart, the quantities are summed:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Item added to cart",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "items": [
      {
        "productId": "65a8f4d3e1234567890abcde",
        "quantity": 5,
        "_id": "65a8f4d3e1234567890abcdf"
      }
    ],
    "createdAt": "2026-01-20T10:30:00.000Z",
    "updatedAt": "2026-01-28T14:26:00.000Z"
  }
}
```

**Behavior:** If a product with `productId: "65a8f4d3e1234567890abcde"` had quantity 3, adding `qty: 2` results in final quantity 5.

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `data._id` | string | Cart identifier (MongoDB ObjectId) |
| `data.userId` | string | User ID (MongoDB ObjectId) |
| `data.items` | array | Updated list of cart items |
| `data.items[].productId` | string | Product ID (MongoDB ObjectId) |
| `data.items[].quantity` | number | Total quantity of this product in cart |
| `data.items[]._id` | string | Cart item entry ID |
| `data.createdAt` | string | Cart creation timestamp (ISO 8601) |
| `data.updatedAt` | string | Last update timestamp (ISO 8601) |

#### Error Responses

| Status Code | Error Code | Message | Cause |
|------------|------------|---------|-------|
| 400 | `VALIDATION_ERROR` | Validation failed | Invalid `productId` format or negative `qty` |
| 401 | `MISSING_TOKEN` | Access token not found, please login again | Missing authentication token |
| 401 | `INVALID_TOKEN` | Invalid authentication token | Malformed JWT |
| 401 | `EXPIRED_TOKEN` | Token expired, please login again | JWT expired |
| 401 | `BLACKLISTED_TOKEN` | Token has been invalidated, please login again | Token revoked |
| 403 | `INSUFFICIENT_PERMISSIONS` | You don't have permission to access this resource | Role is not 'user' |
| 500 | `INTERNAL_SERVER_ERROR` | Something went wrong! | Database error or unexpected failure |

**400 Validation Error Example:**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "details": {
    "errors": [
      {
        "field": "productId",
        "message": "Invalid product ID",
        "value": "invalid-id"
      }
    ]
  }
}
```

**400 Invalid Quantity Example:**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "details": {
    "errors": [
      {
        "field": "qty",
        "message": "Quantity must be a positive integer",
        "value": -2
      }
    ]
  }
}
```

### Edge Cases & Notes

- **Default Quantity:** If `qty` is omitted, defaults to 1
- **Cumulative Addition:** Adding an existing product increments the quantity (does not replace)
- **Cart Creation:** If user has no cart, one is automatically created before adding the item
- **Product Validation:** The service does NOT validate if the `productId` exists in the product catalog; clients should verify product existence before calling this endpoint

---

## 4. Update Item Quantity

**Description:** Updates the quantity of a specific product in the authenticated user's cart to an exact value. Setting quantity to 0 effectively removes the item from the cart.

**Why Use This:** Implement cart quantity adjustment controls (increment/decrement buttons), quantity input fields, or "Remove" functionality.

### Endpoint Details

```
PATCH /api/v1/cart/items/:productId
```

**Authentication:** Required (Bearer Token)  
**Required Role:** `user`  
**Rate Limit:** 100 requests/minute

### Request

**Headers:**

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token: `Bearer <access_token>` |
| `Content-Type` | string | Yes | Must be `application/json` |

**Path Parameters:**

| Parameter | Type | Required | Description | Validation |
|-----------|------|----------|-------------|------------|
| `productId` | string | Yes | MongoDB ObjectId of product to update | Must be valid 24-character hex ObjectId |

**Query Parameters:** None

**Request Body:**

```json
{
  "qty": 5
}
```

**Body Parameters:**

| Field | Type | Required | Default | Description | Validation |
|-------|------|----------|---------|-------------|------------|
| `qty` | number | Yes | - | New exact quantity for the item | Integer, min: 0 |

**Constraints:**
- `productId` (path): Must match `/^[0-9a-fA-F]{24}$/`
- `qty`: Non-negative integer (0 or greater); decimals rejected
- `qty: 0` removes the item from the cart

### Response

#### Success Response (200 OK)

**Case 1: Quantity Updated**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Item updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "items": [
      {
        "productId": "65a8f4d3e1234567890abcde",
        "quantity": 5,
        "_id": "65a8f4d3e1234567890abcdf"
      },
      {
        "productId": "65a8f4d3e1234567890abce0",
        "quantity": 1,
        "_id": "65a8f4d3e1234567890abce1"
      }
    ],
    "createdAt": "2026-01-20T10:30:00.000Z",
    "updatedAt": "2026-01-28T14:30:00.000Z"
  }
}
```

**Case 2: Item Removed (qty = 0)**

When `qty: 0` is sent, the item is removed from the cart:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Item updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "items": [
      {
        "productId": "65a8f4d3e1234567890abce0",
        "quantity": 1,
        "_id": "65a8f4d3e1234567890abce1"
      }
    ],
    "createdAt": "2026-01-20T10:30:00.000Z",
    "updatedAt": "2026-01-28T14:31:00.000Z"
  }
}
```

**Case 3: Cart Becomes Empty**

If the updated item was the last item in the cart:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Item updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "items": [],
    "createdAt": "2026-01-20T10:30:00.000Z",
    "updatedAt": "2026-01-28T14:32:00.000Z"
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `data._id` | string | Cart identifier (MongoDB ObjectId) |
| `data.userId` | string | User ID (MongoDB ObjectId) |
| `data.items` | array | Updated list of cart items |
| `data.items[].productId` | string | Product ID (MongoDB ObjectId) |
| `data.items[].quantity` | number | Updated quantity (or item removed if qty was 0) |
| `data.items[]._id` | string | Cart item entry ID |
| `data.createdAt` | string | Cart creation timestamp (ISO 8601) |
| `data.updatedAt` | string | Last update timestamp (ISO 8601) |

#### Error Responses

| Status Code | Error Code | Message | Cause |
|------------|------------|---------|-------|
| 400 | `VALIDATION_ERROR` | Validation failed | Invalid `productId` format, missing `qty`, or negative `qty` |
| 401 | `MISSING_TOKEN` | Access token not found, please login again | Missing authentication token |
| 401 | `INVALID_TOKEN` | Invalid authentication token | Malformed JWT |
| 401 | `EXPIRED_TOKEN` | Token expired, please login again | JWT expired |
| 401 | `BLACKLISTED_TOKEN` | Token has been invalidated, please login again | Token revoked |
| 403 | `INSUFFICIENT_PERMISSIONS` | You don't have permission to access this resource | Role is not 'user' |
| 404 | `ITEM_NOT_FOUND` | Item not found | Product with specified `productId` does not exist in user's cart |
| 500 | `INTERNAL_SERVER_ERROR` | Something went wrong! | Database error or unexpected failure |

**404 Item Not Found Example:**

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Item not found",
  "errorCode": "ITEM_NOT_FOUND"
}
```

**400 Validation Error Example:**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "details": {
    "errors": [
      {
        "field": "productId",
        "message": "Invalid product ID",
        "value": "not-an-objectid"
      }
    ]
  }
}
```

**400 Missing Quantity Example:**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "details": {
    "errors": [
      {
        "field": "qty",
        "message": "Item quantity is required",
        "value": null
      }
    ]
  }
}
```

### Edge Cases & Notes

- **Exact Quantity:** Unlike [Add Item to Cart](#3-add-item-to-cart), this endpoint sets the quantity to the exact value provided (not cumulative)
- **Remove Item:** Setting `qty: 0` is the standard way to remove an item from the cart
- **Item Must Exist:** You cannot use this endpoint to add new items; the product must already be in the cart
- **Atomic Update:** The quantity update is atomic at the database level
- **No Partial Updates:** If an item doesn't exist, no changes are made to the cart

---

## Additional Information

### Pagination

Currently, the Cart Service does not implement pagination for cart items. All items in a cart are returned in a single response. This design assumes carts will contain a reasonable number of items (typically < 100).

### CORS Configuration

The service supports Cross-Origin Resource Sharing (CORS) for web client integration. Ensure your origin is whitelisted in the service configuration.

### Versioning

The API uses URL-based versioning (`/api/v1`). Major breaking changes will increment the version number (`/api/v2`).

### Data Retention

- **Active Carts:** Retained indefinitely as long as the user account exists
- **Abandoned Carts:** Implementation-specific; check service configuration for TTL policies
- **Deleted Users:** Carts are cascade-deleted when user accounts are removed

### Security Considerations

1. **Token Storage:** Store access tokens securely (HttpOnly cookies recommended)
2. **HTTPS Only:** Always use HTTPS in production to prevent token interception
3. **Token Refresh:** Implement token refresh logic before expiration
4. **Rate Limiting:** Respect rate limits to avoid service throttling
5. **Input Validation:** Client-side validation recommended before API calls

### Support & Contact

For issues, questions, or feature requests:
- **Service Owner:** Platform Engineering Team
- **Repository:** [MarketMind Microservices - Cart Service]
- **Status Page:** [service-status-url]

---

**Last Updated:** January 28, 2026  
**Document Version:** 1.0.0
