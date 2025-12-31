
# 🧾 Order Service (MarketMind)

The **Order Service** is a core microservice of the MarketMind eCommerce platform responsible for **creating and managing customer orders**.

It provides:

- **Order Creation**: Creates orders from the authenticated user's cart.
- **Order Retrieval**: Fetches a single order or a paginated list of user orders.
- **Order Updates**: Allows users to update shipping address (only while pending).
- **Order Cancellation**: Allows users to cancel pending orders.
- **Order Operations (Staff)**: Allows `order_manager` to update order status.
- **Health Monitoring**: Exposes a public health endpoint for monitoring and deployments.

---

## ⚙️ Base URL

All endpoints are prefixed with:

```
/api/v1
```

Default port: `3003`

---

## 🔐 Authentication & Roles

Most endpoints require authentication.

**How to authenticate**

- Provide JWT access token via either:
	- `Authorization: Bearer <accessToken>` header, or
	- `accessToken` cookie

**Roles used by this service**

- `user`: Customer order operations
- `order_manager`: Staff operations for status updates

---

## 📦 Response Format

### Success response

Successful responses follow a consistent wrapper:

```json
{
	"success": true,
	"statusCode": 200,
	"message": "...",
	"data": {},
	"meta": {}
}
```

Notes:

- `data` contains the payload (object or array).
- `meta` is optional (used for pagination in list endpoints).

### Error response

Runtime errors are returned as:

```json
{
	"success": false,
	"statusCode": 401,
	"errorCode": "MISSING_TOKEN",
	"isOperational": true,
	"message": "Access token not found, please login again"
}
```

### Validation errors

Request validation errors (400) return an `errors` array:

```json
{
	"success": false,
	"statusCode": 400,
	"errorCode": "VALIDATION_ERROR",
	"isOperational": true,
	"message": "Validation failed",
	"errors": [
		{ "path": "shippingAddress.city", "message": "City required" }
	]
}
```

---

## 🧩 Data Model (Order)

An order document returned by this service contains (high-level):

- `_id`, `userId`
- `items[]`: `{ productId, quantity, price { amount, currency } }`
- `totalPrice`: `{ amount, currency }`
- `status`: `PENDING | CONFIRMED | SHIPPED | DELIVERED | CANCELLED`
- `customerDetails`: `{ username, fullName { firstName, lastName }, email, phoneNumber }`
- `shippingAddress`: `{ street, city, state, zip, country, landmark?, typeOfAddress }`
- `createdAt`, `updatedAt`

---

## 📚 API Reference

### 1) Health Check

**Description**: Returns application + system health metrics.

- **Endpoint**: `GET /api/v1/health`
- **Auth**: Not required (public)
- **Success**: `200 OK`

**Response Example**

```json
{
	"application": {
		"environment": "DEVELOPMENT",
		"uptime": "1557.06 seconds",
		"memoryUsage": { "heapTotal": "23.58 MB", "heapUsed": "21.41 MB" }
	},
	"system": {
		"cpuUsage": [0, 0, 0],
		"totalMemory": "16105.32 MB",
		"usedMemory": "11078.03 MB",
		"freeMemory": "5027.29 MB"
	},
	"timestamp": 1759783659846
}
```

---

### 2) Create Order

Creates an order from the authenticated user's cart.

- **Endpoint**: `POST /api/v1/orders`
- **Auth**: Required (`user`)
- **Success**: `201 Created`

**Request Body**

```json
{
	"currency": "INR",
	"shippingAddress": {
		"street": "123 Main Street",
		"city": "New York",
		"state": "New York",
		"zip": "10001",
		"country": "united states",
		"landmark": "Near Central Park",
		"typeOfAddress": "home"
	}
}
```

**Rules**

- `currency` is optional and defaults to `INR` (allowed: `INR`, `USD`).
- `shippingAddress.street|city|state|zip` are required.
- `typeOfAddress`: `home` or `work`.
- Order creation fails if the cart is empty.

**Response Example (201)**

```json
{
	"success": true,
	"statusCode": 201,
	"message": "Ordered successfully",
	"data": {
		"_id": "66f1c2f3b7c2a2a111111111",
		"userId": "68fbc422a7decf69519bb708",
		"items": [
			{
				"productId": "66f1c2f3b7c2a2a222222222",
				"quantity": 2,
				"price": { "amount": 499.0, "currency": "INR" }
			}
		],
		"totalPrice": { "amount": 998.0, "currency": "INR" },
		"status": "PENDING",
		"customerDetails": {
			"username": "john_doe",
			"fullName": { "firstName": "John", "lastName": "Doe" },
			"email": "john@example.com",
			"phoneNumber": "+1-555-0100"
		},
		"shippingAddress": {
			"street": "123 Main Street",
			"city": "New York",
			"state": "New York",
			"zip": "10001",
			"country": "united states",
			"landmark": "Near Central Park",
			"typeOfAddress": "home"
		},
		"createdAt": "2025-12-31T00:00:00.000Z",
		"updatedAt": "2025-12-31T00:00:00.000Z"
	}
}
```

**Common Errors**

- `401` `MISSING_TOKEN` / `INVALID_TOKEN` / `EXPIRED_TOKEN`
- `400` `VALIDATION_ERROR` (invalid body)
- `400` `EMPTY_CART`
- `400` `INSUFFICIENT_STOCK`

---

### 3) Get All Orders (User)

Returns a paginated list of orders for the authenticated user.

- **Endpoint**: `GET /api/v1/orders`
- **Auth**: Required (`user`)
- **Success**: `200 OK`

**Query Parameters (optional)**

- `page`: integer (default `1`)
- `limit`: integer 1–100 (default `10`)
- `sortBy`: `createdAt | updatedAt | totalAmount | status` (default `createdAt`)
- `sortType`: `asc | desc` (default `desc`)

**Response Example (200)**

```json
{
	"success": true,
	"statusCode": 200,
	"message": "Orders fetched successfully",
	"data": [],
	"meta": {
		"page": 1,
		"limit": 10,
		"totalOrders": 1,
		"totalPages": 1,
		"ordersPerPage": 10,
		"hasNextPage": false,
		"hasPrevPage": false,
		"nextPage": null,
		"prevPage": null
	}
}
```

---

### 4) Get Order By ID (User)

Fetch a single order by ID (must belong to the authenticated user).

- **Endpoint**: `GET /api/v1/orders/:orderId`
- **Auth**: Required (`user`)
- **Success**: `200 OK`

**Common Errors**

- `400` `VALIDATION_ERROR` (invalid MongoDB ObjectId)
- `404` `NOT_FOUND` (order not found)
- `403` `INSUFFICIENT_PERMISSIONS` (order belongs to another user)

---

### 5) Cancel Order (User)

Cancels an order **only when** it is still `PENDING`.

- **Endpoint**: `PATCH /api/v1/orders/:orderId/cancel`
- **Auth**: Required (`user`)
- **Success**: `200 OK`

**Business Rules**

- Cancellation is allowed only for `PENDING` orders.

**Common Errors**

- `404` `NOT_FOUND` (order not found)
- `400` `ORDER_CANCELLATION_NOT_ALLOWED` (not `PENDING`)
- `403` `INSUFFICIENT_PERMISSIONS` (not your order)

---

### 6) Update Order Shipping Address (User)

Updates shipping address fields for an order **only when** it is still `PENDING`.

- **Endpoint**: `PATCH /api/v1/orders/:orderId/address`
- **Auth**: Required (`user`)
- **Success**: `200 OK`

**Request Body (any subset of)**

```json
{
	"street": "456 New Street",
	"city": "Los Angeles",
	"state": "California",
	"zip": "90001",
	"country": "united states",
	"landmark": "Near Downtown",
	"typeOfAddress": "work"
}
```

**Business Rules**

- Allowed only for `PENDING` orders.
- At least one valid field must be provided.

**Common Errors**

- `400` `ORDER_ADDRESS_UPDATE_NOT_ALLOWED` (not `PENDING`)
- `400` `NO_VALID_ADDRESS_FIELDS` (no recognized fields in body)
- `400` `VALIDATION_ERROR` (invalid field values)

---

### 7) Update Order Status (Staff)

Updates the status of an order.

- **Endpoint**: `PATCH /api/v1/orders/:orderId/status`
- **Auth**: Required (`order_manager`)
- **Success**: `200 OK`

**Request Body**

```json
{ "status": "SHIPPED" }
```

**Allowed status values**

- `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`

**Notes**

- When setting status to `CONFIRMED`, the service attempts to reduce product stock by calling the Product Service.
- Setting `CONFIRMED` when an order is already `CONFIRMED` returns a `400` error.

**Common Errors**

- `403` `INSUFFICIENT_PERMISSIONS` (wrong role)
- `400` `VALIDATION_ERROR` (invalid status)
- `404` `NOT_FOUND` (order not found)
- `400` `ORDER_STATUS_UPDATE_FAILD` (duplicate confirmation)

---

## ▶️ Quick Start (Local)

1) Install dependencies

```bash
npm install
```

2) Configure environment variables (see below)

3) Run the service

```bash
npm run dev
```

---

## 🔧 Configuration (Env Vars)

This service uses `dotenv-flow` (supports `.env*` files).

Minimum recommended variables:

- `PORT` (default: `3003`)
- `MONGODB_URI`
- `ACCESS_TOKEN_SECRET`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- `CROSS_ORIGIN` (default: `http://localhost:5173`)
- `CART_SERVICE_API` (Cart Service URL)
- `PRODUCT_SERVICE_API` (Product Service URL)
- `AUTH_SERVICE_API` (Auth Service URL)

