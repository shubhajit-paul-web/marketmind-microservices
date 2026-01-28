# Payment Service API Documentation

> **Version:** 1.0.0  
> **Base URL:** `/api/v1`  
> **Last Updated:** January 28, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Rate Limiting](#rate-limiting)
4. [Common Response Formats](#common-response-formats)
5. [Error Handling](#error-handling)
6. [API Endpoints](#api-endpoints)
   - [Health Check](#health-check)
   - [Create Payment](#create-payment)
   - [Verify Payment](#verify-payment)
   - [Get Payment Info](#get-payment-info)

---

## Overview

The Payment Service handles payment processing for the MarketMind microservices ecosystem. It integrates with **Razorpay** as the payment gateway and provides endpoints to initiate payments, verify transactions, and retrieve payment details.

### Key Features

- Razorpay payment gateway integration
- Cryptographic signature verification for secure transactions
- Event-driven architecture with RabbitMQ for payment notifications
- Redis-backed token blacklist validation

---

## Authentication

All payment endpoints (except Health Check) require **JWT Bearer Token** authentication.

### Authorization Header

```
Authorization: Bearer <access_token>
```

Alternatively, the token can be provided via cookies:

```
Cookie: accessToken=<access_token>
```

### Token Requirements

| Property | Description |
|----------|-------------|
| Type | JWT (JSON Web Token) |
| Location | `Authorization` header or `accessToken` cookie |
| Required Role | `user` |
| Expiration | Token must be valid and not expired |
| Blacklist | Token must not be in the Redis blacklist (logged out tokens) |

---

## Rate Limiting

The service implements tiered rate limiting to prevent abuse.

### Global Rate Limit

| Parameter | Value |
|-----------|-------|
| Window | 2 minutes |
| Max Requests | 100 requests per IP |
| Headers | `draft-8` standard headers |

### Endpoint-Specific Limits

| Endpoint | Window | Max Requests |
|----------|--------|--------------|
| `POST /payments/create/:orderId` | 2 minutes | 10 requests |
| `POST /payments/verify` | 1 minute | 5 requests |
| `GET /payments/:paymentId` | Global limit | 100 requests |

### Rate Limit Response

When rate limit is exceeded:

```json
{
  "statusCode": 429,
  "message": "Initiate payment rate limit exceeded. Please try again in a minute"
}
```

---

## Common Response Formats

### Success Response (2xx)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Human-readable success message",
  "data": { ... }
}
```

### Created Response (201)

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Human-readable creation message",
  "data": { ... }
}
```

---

## Error Handling

All errors follow a consistent structure for predictable client-side handling.

### Error Response Format

```json
{
  "success": false,
  "statusCode": 400,
  "errorCode": "VALIDATION_ERROR",
  "isOperational": true,
  "message": "Human-readable error description"
}
```

### Error Code Reference

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| `400` | `VALIDATION_ERROR` | Request body/params failed validation |
| `400` | `INVALID_SIGNATURE` | Razorpay signature verification failed |
| `401` | `MISSING_TOKEN` | No access token provided |
| `401` | `INVALID_TOKEN` | Token is malformed or invalid |
| `401` | `EXPIRED_TOKEN` | JWT token has expired |
| `401` | `BLACKLISTED_TOKEN` | Token has been invalidated (logged out) |
| `403` | `INSUFFICIENT_PERMISSIONS` | User role not authorized for this endpoint |
| `404` | `NOT_FOUND` | Requested resource (order/payment) not found |
| `429` | `RATE_LIMIT_EXCEEDED` | Too many requests |
| `500` | `PAYMENT_CREATION_FAILED` | Razorpay order creation failed |
| `500` | `INTERNAL_SERVER_ERROR` | Unexpected server error |

---

## API Endpoints

---

### Health Check

Check the application and system health status.

```
GET /api/v1/health
```

#### Authentication

**None required** — Public endpoint

#### Rate Limit

Global limit: 100 requests / 2 minutes

#### Request Parameters

None

#### Success Response

**Status:** `200 OK`

```json
{
  "application": {
    "name": "payment-service",
    "version": "1.0.0",
    "status": "healthy",
    "uptime": 3600
  },
  "system": {
    "platform": "linux",
    "cpuUsage": 15.5,
    "memoryUsage": {
      "total": 8589934592,
      "used": 4294967296,
      "free": 4294967296
    }
  },
  "timestamp": 1738076400000
}
```

#### Use Case

Used by load balancers, Kubernetes probes, and monitoring systems to verify service availability.

---

### Create Payment

Initiate a new payment for an existing order. Creates a Razorpay order and returns payment credentials for client-side checkout.

```
POST /api/v1/payments/create/:orderId
```

#### Authentication

**Required** — Bearer Token (Role: `user`)

#### Rate Limit

10 requests / 2 minutes per IP

#### Request Parameters

##### Path Parameters

| Parameter | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| `orderId` | `string` | **Yes** | Valid MongoDB ObjectId (24 hex characters) | The unique identifier of the order to pay for |

##### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | `string` | **Yes** | `Bearer <access_token>` |
| `Content-Type` | `string` | No | `application/json` |

#### Request Example

```bash
curl -X POST "https://api.example.com/api/v1/payments/create/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Success Response

**Status:** `201 Created`

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Payment initiated successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789012abcd",
    "userId": "507f1f77bcf86cd799439011",
    "orderId": "507f1f77bcf86cd799439012",
    "razorpayOrderId": "order_N5jMKr8jMqwxEp",
    "status": "PENDING",
    "price": {
      "amount": 1499.99,
      "currency": "INR"
    },
    "createdAt": "2026-01-28T10:30:00.000Z",
    "updatedAt": "2026-01-28T10:30:00.000Z"
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `_id` | `string` | Unique payment record identifier (MongoDB ObjectId) |
| `userId` | `string` | ID of the user who initiated the payment |
| `orderId` | `string` | Associated order identifier |
| `razorpayOrderId` | `string` | Razorpay order ID for client-side checkout |
| `status` | `string` | Payment status: `PENDING`, `COMPLETED`, or `FAILED` |
| `price.amount` | `number` | Payment amount in the specified currency |
| `price.currency` | `string` | Currency code: `INR` or `USD` |
| `createdAt` | `string` | ISO 8601 timestamp of creation |
| `updatedAt` | `string` | ISO 8601 timestamp of last update |

#### Error Responses

##### 400 Bad Request — Invalid Order ID

```json
{
  "success": false,
  "statusCode": 400,
  "errorCode": "VALIDATION_ERROR",
  "isOperational": true,
  "message": "Invalid order id"
}
```

##### 401 Unauthorized — Missing Token

```json
{
  "success": false,
  "statusCode": 401,
  "errorCode": "MISSING_TOKEN",
  "isOperational": true,
  "message": "Access token not found, please login again"
}
```

##### 401 Unauthorized — Expired Token

```json
{
  "success": false,
  "statusCode": 401,
  "errorCode": "EXPIRED_TOKEN",
  "isOperational": true,
  "message": "Token expired, please login again"
}
```

##### 401 Unauthorized — Blacklisted Token

```json
{
  "success": false,
  "statusCode": 401,
  "errorCode": "BLACKLISTED_TOKEN",
  "isOperational": true,
  "message": "Token has been invalidated, please login again"
}
```

##### 403 Forbidden — Insufficient Permissions

```json
{
  "success": false,
  "statusCode": 403,
  "errorCode": "INSUFFICIENT_PERMISSIONS",
  "isOperational": true,
  "message": "You don't have permission to access this resource"
}
```

##### 404 Not Found — Order Not Found

```json
{
  "success": false,
  "statusCode": 404,
  "errorCode": "NOT_FOUND",
  "isOperational": true,
  "message": "Order not found"
}
```

##### 429 Too Many Requests

```json
{
  "statusCode": 429,
  "message": "Initiate payment rate limit exceeded. Please try again in a minute"
}
```

##### 500 Internal Server Error — Payment Creation Failed

```json
{
  "success": false,
  "statusCode": 500,
  "errorCode": "PAYMENT_CREATION_FAILED",
  "isOperational": true,
  "message": "Failed to create payment order, try again later."
}
```

#### Notes

- The `razorpayOrderId` returned should be used to initialize the Razorpay checkout on the client side.
- Amount is stored in the base currency unit but sent to Razorpay in the smallest unit (paise for INR).
- A message is published to `PAYMENT_SELLER_DASHBOARD.PAYMENT_INITIATED` queue upon successful creation.

---

### Verify Payment

Verify a completed payment using Razorpay's cryptographic signature verification. Updates the payment status to `COMPLETED` upon successful verification.

```
POST /api/v1/payments/verify
```

#### Authentication

**Required** — Bearer Token (Role: `user`)

#### Rate Limit

5 requests / 1 minute per IP

#### Request Parameters

##### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | `string` | **Yes** | `Bearer <access_token>` |
| `Content-Type` | `string` | **Yes** | `application/json` |

##### Body Parameters

| Parameter | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| `razorpayOrderId` | `string` | **Yes** | Non-empty, trimmed string | The Razorpay order ID returned during payment creation |
| `paymentId` | `string` | **Yes** | Non-empty, trimmed string | The Razorpay payment ID received after successful payment |
| `signature` | `string` | **Yes** | Non-empty, trimmed string | HMAC SHA256 signature for verification |

#### Request Example

```bash
curl -X POST "https://api.example.com/api/v1/payments/verify" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "razorpayOrderId": "order_N5jMKr8jMqwxEp",
    "paymentId": "pay_N5jMKr8jMqwxEq",
    "signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
  }'
```

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Payment verified successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789012abcd",
    "userId": "507f1f77bcf86cd799439011",
    "orderId": "507f1f77bcf86cd799439012",
    "paymentId": "pay_N5jMKr8jMqwxEq",
    "razorpayOrderId": "order_N5jMKr8jMqwxEp",
    "signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d",
    "status": "COMPLETED",
    "price": {
      "amount": 1499.99,
      "currency": "INR"
    },
    "createdAt": "2026-01-28T10:30:00.000Z",
    "updatedAt": "2026-01-28T10:35:00.000Z"
  }
}
```

#### Error Responses

##### 400 Bad Request — Missing Required Fields

```json
{
  "success": false,
  "statusCode": 400,
  "errorCode": "VALIDATION_ERROR",
  "isOperational": true,
  "message": "Razorpay order id is required"
}
```

```json
{
  "success": false,
  "statusCode": 400,
  "errorCode": "VALIDATION_ERROR",
  "isOperational": true,
  "message": "Payment id is required"
}
```

```json
{
  "success": false,
  "statusCode": 400,
  "errorCode": "VALIDATION_ERROR",
  "isOperational": true,
  "message": "Signature is required"
}
```

##### 400 Bad Request — Invalid Signature

```json
{
  "success": false,
  "statusCode": 400,
  "errorCode": "INVALID_SIGNATURE",
  "isOperational": true,
  "message": "Invalid signature"
}
```

##### 401 Unauthorized — Missing Token

```json
{
  "success": false,
  "statusCode": 401,
  "errorCode": "MISSING_TOKEN",
  "isOperational": true,
  "message": "Access token not found, please login again"
}
```

##### 404 Not Found — Payment Not Found

```json
{
  "success": false,
  "statusCode": 404,
  "errorCode": "NOT_FOUND",
  "isOperational": true,
  "message": "Payment not found"
}
```

##### 429 Too Many Requests

```json
{
  "statusCode": 429,
  "message": "Verify payment rate limit exceeded. Please try again in a minute"
}
```

#### Notes

- The signature is verified using Razorpay's `validatePaymentVerification` utility with HMAC SHA256.
- Upon successful verification, messages are published to:
  - `PAYMENT_NOTIFICATION.PAYMENT_SUCCESSFUL` — For email/push notifications
  - `PAYMENT_SELLER_DASHBOARD.PAYMENT_SUCCESSFUL` — For seller analytics
- Upon failed verification, a message is published to `PAYMENT_NOTIFICATION.PAYMENT_FAILD` queue.
- Only payments with `PENDING` status can be verified.

---

### Get Payment Info

Retrieve detailed information about a specific payment.

```
GET /api/v1/payments/:paymentId
```

#### Authentication

**Required** — Bearer Token (Role: `user`)

#### Rate Limit

Global limit: 100 requests / 2 minutes

#### Request Parameters

##### Path Parameters

| Parameter | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| `paymentId` | `string` | **Yes** | Valid MongoDB ObjectId | The unique payment record identifier |

##### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | `string` | **Yes** | `Bearer <access_token>` |

#### Request Example

```bash
curl -X GET "https://api.example.com/api/v1/payments/65a1b2c3d4e5f6789012abcd" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Payment info fetched successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789012abcd",
    "userId": "507f1f77bcf86cd799439011",
    "orderId": "507f1f77bcf86cd799439012",
    "paymentId": "pay_N5jMKr8jMqwxEq",
    "razorpayOrderId": "order_N5jMKr8jMqwxEp",
    "status": "COMPLETED",
    "price": {
      "amount": 1499.99,
      "currency": "INR"
    },
    "createdAt": "2026-01-28T10:30:00.000Z",
    "updatedAt": "2026-01-28T10:35:00.000Z"
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `_id` | `string` | Unique payment record identifier |
| `userId` | `string` | ID of the user who made the payment |
| `orderId` | `string` | Associated order identifier |
| `paymentId` | `string` | Razorpay payment ID (present after verification) |
| `razorpayOrderId` | `string` | Razorpay order ID |
| `status` | `string` | Payment status: `PENDING`, `COMPLETED`, or `FAILED` |
| `price.amount` | `number` | Payment amount |
| `price.currency` | `string` | Currency code: `INR` or `USD` |
| `createdAt` | `string` | ISO 8601 timestamp of creation |
| `updatedAt` | `string` | ISO 8601 timestamp of last update |

> **Note:** The `signature` field is excluded from the response for security reasons.

#### Error Responses

##### 401 Unauthorized — Missing Token

```json
{
  "success": false,
  "statusCode": 401,
  "errorCode": "MISSING_TOKEN",
  "isOperational": true,
  "message": "Access token not found, please login again"
}
```

##### 404 Not Found — Payment Not Found

```json
{
  "success": false,
  "statusCode": 404,
  "errorCode": "NOT_FOUND",
  "isOperational": true,
  "message": "Payment not found"
}
```

#### Notes

- Users can only retrieve payments associated with their own `userId`.
- The `signature` field is intentionally excluded from the response for security purposes.

---

## Data Models

### Payment Object

| Field | Type | Description |
|-------|------|-------------|
| `_id` | `ObjectId` | Unique identifier |
| `userId` | `ObjectId` | Reference to the user |
| `orderId` | `ObjectId` | Reference to the order |
| `paymentId` | `string` | Razorpay payment ID |
| `razorpayOrderId` | `string` | Razorpay order ID |
| `signature` | `string` | Verification signature |
| `status` | `enum` | `PENDING` \| `COMPLETED` \| `FAILED` |
| `price` | `object` | Price details |
| `price.amount` | `number` | Amount (min: 0) |
| `price.currency` | `enum` | `INR` \| `USD` |
| `createdAt` | `Date` | Creation timestamp |
| `updatedAt` | `Date` | Last update timestamp |

---

## Integration Guide

### Client-Side Razorpay Checkout Flow

1. **Create Payment:** Call `POST /api/v1/payments/create/:orderId` to get `razorpayOrderId`
2. **Initialize Checkout:** Use the `razorpayOrderId` with Razorpay's JavaScript SDK
3. **Handle Callback:** On payment success, Razorpay returns `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`
4. **Verify Payment:** Call `POST /api/v1/payments/verify` with the callback data
5. **Confirm Status:** Check the response to confirm payment completion

### Example Razorpay Checkout Integration

```javascript
const options = {
  key: "rzp_live_XXXXXXXXXXXXXX",
  amount: paymentData.price.amount * 100,
  currency: paymentData.price.currency,
  order_id: paymentData.razorpayOrderId,
  handler: async function (response) {
    await fetch("/api/v1/payments/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        razorpayOrderId: response.razorpay_order_id,
        paymentId: response.razorpay_payment_id,
        signature: response.razorpay_signature
      })
    });
  }
};

const rzp = new Razorpay(options);
rzp.open();
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-28 | Initial release |

---

## Support

For API support or to report issues, contact the development team or raise an issue in the repository.
