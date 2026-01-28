# Seller Dashboard Service

## API Documentation

**Base URL:** `/api/v1`  
**Version:** 1.0.0  
**Last Updated:** January 13, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Standard Response Format](#standard-response-format)
4. [Error Handling](#error-handling)
5. [Endpoints](#endpoints)
   - [Health Check](#1-health-check)
   - [Get Seller Metrics](#2-get-seller-metrics)
   - [Get Seller Orders](#3-get-seller-orders)

---

## Overview

The Seller Dashboard Service provides authenticated sellers with access to their dashboard metrics and order management capabilities within the MarketMind microservices ecosystem.

| Property | Value |
|----------|-------|
| Protocol | HTTPS |
| Content-Type | `application/json` |
| Character Encoding | UTF-8 |

---

## Authentication

All seller dashboard endpoints require authentication via **JWT Bearer Token**.

### Authentication Method

```
Authorization: Bearer <access_token>
```

Alternatively, the access token can be sent via HTTP-only cookie:

```
Cookie: accessToken=<access_token>
```

### Required Role

- `seller` — Only users with the seller role can access dashboard endpoints.

### Token Validation

The service validates tokens against a Redis blacklist to ensure logged-out tokens cannot be reused.

---

## Standard Response Format

### Success Response (2xx)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Human-readable success message",
  "data": { ... },
  "meta": { ... }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Always `true` for successful responses |
| `statusCode` | integer | HTTP status code |
| `message` | string | Descriptive success message |
| `data` | object/array/null | Response payload |
| `meta` | object/null | Pagination or additional metadata (when applicable) |

### Error Response (4xx/5xx)

```json
{
  "success": false,
  "statusCode": 401,
  "errorCode": "INVALID_TOKEN",
  "isOperational": true,
  "message": "Human-readable error message"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Always `false` for error responses |
| `statusCode` | integer | HTTP status code |
| `errorCode` | string | Machine-readable error identifier |
| `isOperational` | boolean | `true` if error is expected/handled |
| `message` | string | Descriptive error message |
| `errors` | array | Validation error details (only for 400 validation errors) |

---

## Error Handling

### Authentication Errors

| HTTP Code | Error Code | Message | Cause |
|-----------|------------|---------|-------|
| `401` | `MISSING_TOKEN` | Access token not found, please login again | No token provided in request |
| `401` | `INVALID_TOKEN` | Invalid authentication token | Token is malformed or signature invalid |
| `401` | `EXPIRED_TOKEN` | Token expired, please login again | JWT has expired |
| `401` | `BLACKLISTED_TOKEN` | Token has been invalidated, please login again | Token was logged out/revoked |
| `403` | `INSUFFICIENT_PERMISSIONS` | You don't have permission to access this resource | User role is not `seller` |

### Validation Errors

| HTTP Code | Error Code | Message | Cause |
|-----------|------------|---------|-------|
| `400` | `VALIDATION_ERROR` | Validation failed | Request parameters failed validation rules |

**Validation Error Response Example:**

```json
{
  "success": false,
  "statusCode": 400,
  "errorCode": "VALIDATION_ERROR",
  "isOperational": true,
  "message": "Validation failed",
  "errors": [
    {
      "path": "page",
      "message": "Page must be a positive integer"
    },
    {
      "path": "limit",
      "message": "Limit must be between 1 and 100"
    }
  ]
}
```

### General Errors

| HTTP Code | Error Code | Message | Cause |
|-----------|------------|---------|-------|
| `404` | `NOT_FOUND` | {path} not found | Requested endpoint does not exist |
| `500` | `INTERNAL_SERVER_ERROR` | Something went wrong | Unexpected server error |

---

## Endpoints

---

### 1. Health Check

Check the application and system health status.

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/api/v1/health` |
| **Authentication** | None (Public) |
| **Rate Limit** | Standard |

#### Request

No parameters required.

#### Success Response

**Status Code:** `200 OK`

```json
{
  "application": {
    "environment": "PRODUCTION",
    "uptime": "3600.00 seconds",
    "memoryUsage": {
      "heapTotal": "128.50 MB",
      "heapUsed": "64.25 MB"
    }
  },
  "system": {
    "cpuUsage": [0.5, 0.75, 0.6],
    "totalMemory": "16384.00 MB",
    "usedMemory": "8192.00 MB",
    "freeMemory": "8192.00 MB"
  },
  "timestamp": 1738022400000
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `application.environment` | string | Current environment (`DEVELOPMENT`, `PRODUCTION`) |
| `application.uptime` | string | Application uptime in seconds |
| `application.memoryUsage.heapTotal` | string | Total heap memory allocated |
| `application.memoryUsage.heapUsed` | string | Heap memory currently in use |
| `system.cpuUsage` | array | System load averages (1, 5, 15 minutes) |
| `system.totalMemory` | string | Total system memory |
| `system.usedMemory` | string | Used system memory |
| `system.freeMemory` | string | Available system memory |
| `timestamp` | integer | Unix timestamp (milliseconds) |

---

### 2. Get Seller Metrics

Retrieve aggregated dashboard metrics for the authenticated seller, including total sales, revenue, and top-performing products.

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/api/v1/seller/dashboard/metrics` |
| **Authentication** | Bearer Token (Role: `seller`) |
| **Rate Limit** | Standard |

#### Request

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <access_token>` |

No query parameters required.

#### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Metrics fetched successfully",
  "data": {
    "totalSales": 1250,
    "totalRevenue": 2875000,
    "topProducts": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Wireless Bluetooth Headphones",
        "category": "electronics",
        "stock": 45,
        "price": {
          "amount": 2499,
          "currency": "INR"
        },
        "sold": 320,
        "totalRevenue": 799680
      },
      {
        "_id": "507f1f77bcf86cd799439012",
        "name": "USB-C Fast Charging Cable",
        "category": "accessories",
        "stock": 200,
        "price": {
          "amount": 599,
          "currency": "INR"
        },
        "sold": 180,
        "totalRevenue": 107820
      }
    ]
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `data.totalSales` | integer | Total units sold across all products |
| `data.totalRevenue` | number | Total revenue earned (in smallest currency unit) |
| `data.topProducts` | array | Top 10 products sorted by units sold (descending) |
| `data.topProducts[]._id` | ObjectId | Product unique identifier |
| `data.topProducts[].name` | string | Product name |
| `data.topProducts[].category` | string | Product category |
| `data.topProducts[].stock` | integer | Current inventory count |
| `data.topProducts[].price` | object | Product pricing information |
| `data.topProducts[].price.amount` | number | Price in smallest currency unit |
| `data.topProducts[].price.currency` | string | Currency code (`INR`, `USD`) |
| `data.topProducts[].sold` | integer | Units sold for this product |
| `data.topProducts[].totalRevenue` | number | Revenue from this product |

**Empty State Response:**

When the seller has no products:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Metrics fetched successfully",
  "data": {
    "totalSales": 0,
    "totalRevenue": 0,
    "topProducts": []
  }
}
```

#### Error Responses

| Status | Error Code | Message |
|--------|------------|---------|
| `401` | `MISSING_TOKEN` | Access token not found, please login again |
| `401` | `INVALID_TOKEN` | Invalid authentication token |
| `401` | `EXPIRED_TOKEN` | Token expired, please login again |
| `401` | `BLACKLISTED_TOKEN` | Token has been invalidated, please login again |
| `403` | `INSUFFICIENT_PERMISSIONS` | You don't have permission to access this resource |

---

### 3. Get Seller Orders

Retrieve paginated orders containing the seller's products with optional filtering and sorting.

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/api/v1/seller/dashboard/orders` |
| **Authentication** | Bearer Token (Role: `seller`) |
| **Rate Limit** | Standard |

#### Request

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <access_token>` |

**Query Parameters:**

| Parameter | Type | Required | Default | Constraints | Description |
|-----------|------|----------|---------|-------------|-------------|
| `page` | integer | No | `1` | min: 1 | Page number for pagination |
| `limit` | integer | No | `10` | min: 1, max: 100 | Number of orders per page |
| `sortBy` | string | No | `createdAt` | enum: `createdAt`, `updatedAt`, `status` | Field to sort by |
| `sortType` | string | No | `desc` | enum: `asc`, `desc` | Sort direction |
| `status` | string | No | — | enum: `PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED` | Filter orders by status |

**Example Request:**

```
GET /api/v1/seller/dashboard/orders?page=1&limit=20&sortBy=createdAt&sortType=desc&status=PENDING
```

#### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Orders fetched successfully",
  "data": [
    {
      "productDetails": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Wireless Bluetooth Headphones",
        "category": "electronics",
        "price": {
          "amount": 2499,
          "totalAmount": 4998,
          "currency": "INR"
        },
        "quantity": 2
      },
      "orderDetails": {
        "status": "PENDING",
        "customerDetails": {
          "username": "john_doe",
          "fullName": {
            "firstName": "John",
            "lastName": "Doe"
          },
          "email": "john.doe@example.com",
          "phoneNumber": "+91-9876543210"
        },
        "shippingAddress": {
          "street": "123 Main Street",
          "city": "Mumbai",
          "state": "Maharashtra",
          "zip": "400001",
          "country": "India",
          "landmark": "Near Central Mall",
          "typeOfAddress": "home"
        },
        "createdAt": "2026-01-28T10:30:00.000Z",
        "updatedAt": "2026-01-28T10:30:00.000Z"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalOrders": 150,
    "totalPages": 8,
    "ordersCount": 20,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `data` | array | Array of order items belonging to the seller |
| `data[].productDetails` | object | Product information for this order item |
| `data[].productDetails._id` | ObjectId | Product unique identifier |
| `data[].productDetails.name` | string | Product name |
| `data[].productDetails.category` | string | Product category |
| `data[].productDetails.quantity` | integer | Quantity ordered |
| `data[].productDetails.price.amount` | number | Unit price |
| `data[].productDetails.price.totalAmount` | number | Total price (unit × quantity) |
| `data[].productDetails.price.currency` | string | Currency code (`INR`, `USD`) |
| `data[].orderDetails` | object | Order information |
| `data[].orderDetails.status` | string | Order status |
| `data[].orderDetails.customerDetails` | object | Customer information |
| `data[].orderDetails.shippingAddress` | object | Delivery address |
| `data[].orderDetails.createdAt` | ISO 8601 | Order creation timestamp |
| `data[].orderDetails.updatedAt` | ISO 8601 | Last update timestamp |

**Pagination Metadata (`meta`):**

| Field | Type | Description |
|-------|------|-------------|
| `page` | integer | Current page number |
| `limit` | integer | Items per page |
| `totalOrders` | integer | Total matching orders |
| `totalPages` | integer | Total number of pages |
| `ordersCount` | integer | Number of items in current response |
| `hasNextPage` | boolean | Whether next page exists |
| `hasPrevPage` | boolean | Whether previous page exists |
| `nextPage` | integer/null | Next page number (null if none) |
| `prevPage` | integer/null | Previous page number (null if none) |

**Empty State Response:**

When no orders match the criteria:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Orders fetched successfully",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalOrders": 0,
    "totalPages": 0,
    "ordersCount": 0,
    "hasNextPage": false,
    "hasPrevPage": false,
    "nextPage": null,
    "prevPage": null
  }
}
```

#### Error Responses

| Status | Error Code | Message | Cause |
|--------|------------|---------|-------|
| `400` | `VALIDATION_ERROR` | Validation failed | Invalid query parameters |
| `401` | `MISSING_TOKEN` | Access token not found, please login again | No token provided |
| `401` | `INVALID_TOKEN` | Invalid authentication token | Malformed token |
| `401` | `EXPIRED_TOKEN` | Token expired, please login again | JWT expired |
| `401` | `BLACKLISTED_TOKEN` | Token has been invalidated, please login again | Token revoked |
| `403` | `INSUFFICIENT_PERMISSIONS` | You don't have permission to access this resource | Not a seller |

**Validation Error Examples:**

```json
{
  "success": false,
  "statusCode": 400,
  "errorCode": "VALIDATION_ERROR",
  "isOperational": true,
  "message": "Validation failed",
  "errors": [
    {
      "path": "page",
      "message": "Page must be a positive integer"
    }
  ]
}
```

```json
{
  "success": false,
  "statusCode": 400,
  "errorCode": "VALIDATION_ERROR",
  "isOperational": true,
  "message": "Validation failed",
  "errors": [
    {
      "path": "sortBy",
      "message": "sortBy must be one of: createdAt, updatedAt or status"
    }
  ]
}
```

```json
{
  "success": false,
  "statusCode": 400,
  "errorCode": "VALIDATION_ERROR",
  "isOperational": true,
  "message": "Validation failed",
  "errors": [
    {
      "path": "status",
      "message": "Order status must be one of: pending, confirmed, shipped, delivered or cancelled"
    }
  ]
}
```

---

## Data Models Reference

### Order Status Enum

| Value | Description |
|-------|-------------|
| `PENDING` | Order placed, awaiting confirmation |
| `CONFIRMED` | Order confirmed by seller |
| `SHIPPED` | Order dispatched for delivery |
| `DELIVERED` | Order successfully delivered |
| `CANCELLED` | Order cancelled |

### Currency Enum

| Value | Description |
|-------|-------------|
| `INR` | Indian Rupee |
| `USD` | United States Dollar |

### Address Type Enum

| Value | Description |
|-------|-------------|
| `home` | Residential address |
| `work` | Business/office address |

---

## Notes

1. **Cancelled Orders**: The metrics endpoint excludes cancelled orders when calculating `totalSales` and `totalRevenue`.

2. **Top Products Limit**: The metrics endpoint returns a maximum of 10 top-performing products.

3. **Pagination Behavior**: The orders endpoint paginates at the order level, not the individual item level. A single response may contain multiple items from the same order if multiple seller products were ordered together.

4. **Price Handling**: All monetary values are stored and returned in the smallest currency unit (e.g., paise for INR, cents for USD).

---
