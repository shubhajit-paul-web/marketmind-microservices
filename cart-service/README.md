# 🛒 Cart Service

The **Cart Service** is a core microservice for the MarketMind eCommerce platform, responsible for managing user shopping carts and providing seamless cart operations.

<br>

This service provides a stand-alone solution for:

* **Cart Management:** Handling user shopping cart retrieval and management.
* **Item Operations:** Adding products to the cart, updating quantities, and removing items (by setting quantity to 0).
* **Cart State Persistence:** Storing cart data in MongoDB with automatic creation for new users.
* **Authenticated Access:** All cart operations require valid user authentication via access tokens.
* **Health Monitoring:** Exposing a `GET /api/v1/health` endpoint to monitor application and system status.

<br><br>

## ⚙️ API Reference

All cart endpoints require authentication. Only users with the `user` role can access these endpoints.

<br>

> ## Health check

**Description:** <br>
Check the application's and system's health status.

**Purpose:**<br>
Used by internal monitoring tools, deployment pipelines, and load balancers to verify the application and system health.

**Endpoint:** `GET /api/v1/health`

**Authentication:** Not required (Public endpoint)

**Response Example (200 OK):**

```json
{
    "application": {
        "environment": "DEVELOPMENT",
        "uptime": "1557.06 seconds",
        "memoryUsage": {
            "heapTotal": "23.58 MB",
            "heapUsed": "21.41 MB"
        }
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

<br>
<details>
  <summary><b>Response Details</b></summary>

<br>

| Field                               | Type            | Description                                                          |
| ----------------------------------- | --------------- | -------------------------------------------------------------------- |
| `application.environment`           | `string`        | The current runtime environment (e.g., DEVELOPMENT, PRODUCTION).     |
| `application.uptime`                | `string`        | Time (in seconds) the application has been running since startup.    |
| `application.memoryUsage.heapTotal` | `string`        | Total allocated heap memory.                                         |
| `application.memoryUsage.heapUsed`  | `string`        | Heap memory currently in use.                                        |
| `system.cpuUsage`                   | `array<number>` | CPU usage per core (values between 0 and 1).                         |
| `system.totalMemory`                | `string`        | Total system memory available.                                       |
| `system.usedMemory`                 | `string`        | Memory currently in use by the system.                               |
| `system.freeMemory`                 | `string`        | Available free memory on the system.                                 |
| `timestamp`                         | `number`        | Unix timestamp (in milliseconds) when the health check was executed. |

</details>

<details>
    <summary><b>Usage</b></summary>

<br>

You can use this endpoint to:

- Monitor app uptime and memory usage
- Integrate with health monitoring tools (e.g., Grafana, Prometheus, Datadog)
- Implement load balancer health checks
- Validate deployment stability after CI/CD pipeline runs

</details>

<details>
    <summary><b>Expected HTTP Status Codes</b></summary>

<br>

| Status Code                 | Meaning                                                    |
| --------------------------- | ---------------------------------------------------------- |
| `200 OK`                    | Application and system health data retrieved successfully. |
| `500 Internal Server Error` | Server error occurred while fetching health information.   |

</details>

<br>

---

<br>

> ## Get User's Cart

**Description:** <br>
Retrieve the shopping cart for the authenticated user, including all items, quantities, and cart totals.

**Purpose:**<br>
Used to display the user's current cart contents on the shopping cart page or checkout flow. If the user has no cart yet, a new empty cart is automatically created.

**Endpoint:** `GET /api/v1/cart`

**Authentication:** Required (Private endpoint - User role)

**Headers:**
```
Cookie: accessToken=<your_access_token>
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "message": "Cart fetched successfully",
    "data": {
        "cart": {
            "_id": "676123abc456def789012345",
            "userId": "675a1b2c3d4e5f6789abcdef",
            "items": [
                {
                    "productId": "674d5e6f7a8b9c0123456789",
                    "quantity": 2,
                    "_id": "676123def456abc789012346"
                },
                {
                    "productId": "674d5e6f7a8b9c0123456790",
                    "quantity": 1,
                    "_id": "676123def456abc789012347"
                }
            ],
            "createdAt": "2024-12-17T10:30:00.000Z",
            "updatedAt": "2024-12-17T11:15:00.000Z",
            "__v": 0
        },
        "totals": {
            "itemCount": 2,
            "totalQuantity": 3
        }
    }
}
```

<br>
<details>
  <summary><b>Response Details</b></summary>

<br>

| Field                       | Type      | Description                                                      |
| --------------------------- | --------- | ---------------------------------------------------------------- |
| `success`                   | `boolean` | Indicates whether the request was successful.                    |
| `message`                   | `string`  | A human-readable message describing the result.                  |
| `data.cart._id`             | `string`  | Unique identifier for the cart document.                         |
| `data.cart.userId`          | `string`  | ID of the user who owns this cart.                               |
| `data.cart.items`           | `array`   | Array of items in the cart.                                      |
| `data.cart.items.productId` | `string`  | ID of the product in the cart.                                   |
| `data.cart.items.quantity`  | `number`  | Quantity of this product in the cart (minimum: 1).               |
| `data.cart.items._id`       | `string`  | Unique identifier for this cart item entry.                      |
| `data.cart.createdAt`       | `string`  | ISO 8601 timestamp when the cart was created.                    |
| `data.cart.updatedAt`       | `string`  | ISO 8601 timestamp when the cart was last modified.              |
| `data.totals.itemCount`     | `number`  | Total number of unique products in the cart.                     |
| `data.totals.totalQuantity` | `number`  | Total quantity of all items in the cart (sum of all quantities). |

</details>

<details>
    <summary><b>Usage</b></summary>

<br>

You can use this endpoint to:

- Display the user's cart on the shopping cart page
- Show cart item count in the navigation header
- Load cart data before proceeding to checkout
- Sync cart state when the user logs in from a new device

</details>

<details>
    <summary><b>Expected HTTP Status Codes</b></summary>

<br>

| Status Code                 | Meaning                                                                 |
| --------------------------- | ----------------------------------------------------------------------- |
| `200 OK`                    | Cart retrieved successfully.                                            |
| `401 Unauthorized`          | Access token is missing, invalid, expired, or blacklisted.              |
| `403 Forbidden`             | User does not have the required permissions to access this resource.    |
| `500 Internal Server Error` | Server error occurred while retrieving the cart.                        |

</details>

<br>

---

<br>

> ## Add Item to Cart

**Description:** <br>
Add a product to the authenticated user's cart. If the product already exists in the cart, its quantity will be incremented by the specified amount.

**Purpose:**<br>
Used when a user clicks "Add to Cart" on a product page. This endpoint intelligently handles both new items and existing items by updating quantities accordingly.

**Endpoint:** `POST /api/v1/cart/items`

**Authentication:** Required (Private endpoint - User role)

**Headers:**
```
Cookie: accessToken=<your_access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
    "productId": "674d5e6f7a8b9c0123456789",
    "qty": 2
}
```

**Request Body Parameters:**

| Parameter   | Type     | Required | Description                                                   |
| ----------- | -------- | -------- | ------------------------------------------------------------- |
| `productId` | `string` | Yes      | Valid MongoDB ObjectId of the product to add to the cart.     |
| `qty`       | `number` | No       | Quantity to add (must be a positive integer). Defaults to 1.  |

**Response Example (200 OK):**

```json
{
    "success": true,
    "message": "Item added to cart",
    "data": {
        "_id": "676123abc456def789012345",
        "userId": "675a1b2c3d4e5f6789abcdef",
        "items": [
            {
                "productId": "674d5e6f7a8b9c0123456789",
                "quantity": 2,
                "_id": "676123def456abc789012346"
            }
        ],
        "createdAt": "2024-12-17T10:30:00.000Z",
        "updatedAt": "2024-12-17T11:20:00.000Z",
        "__v": 0
    }
}
```

<br>
<details>
  <summary><b>Response Details</b></summary>

<br>

| Field                 | Type      | Description                                                      |
| --------------------- | --------- | ---------------------------------------------------------------- |
| `success`             | `boolean` | Indicates whether the request was successful.                    |
| `message`             | `string`  | A human-readable message describing the result.                  |
| `data._id`            | `string`  | Unique identifier for the cart document.                         |
| `data.userId`         | `string`  | ID of the user who owns this cart.                               |
| `data.items`          | `array`   | Updated array of items in the cart.                              |
| `data.items.productId`| `string`  | ID of the product in the cart.                                   |
| `data.items.quantity` | `number`  | Updated quantity of this product in the cart.                    |
| `data.items._id`      | `string`  | Unique identifier for this cart item entry.                      |
| `data.createdAt`      | `string`  | ISO 8601 timestamp when the cart was created.                    |
| `data.updatedAt`      | `string`  | ISO 8601 timestamp when the cart was last modified.              |

</details>

<details>
    <summary><b>Behavior</b></summary>

<br>

**If the product does NOT exist in the cart:**
- A new item entry is created with the specified quantity

**If the product ALREADY exists in the cart:**
- The existing quantity is incremented by the specified `qty` value
- Example: If the cart has 3 units of a product and you add 2 more, the final quantity becomes 5

</details>

<details>
    <summary><b>Usage</b></summary>

<br>

You can use this endpoint to:

- Add products to the cart from product detail pages
- Implement "Add to Cart" buttons throughout the application
- Handle quick-add functionality from product listing pages
- Update cart state after user interactions

</details>

<details>
    <summary><b>Expected HTTP Status Codes</b></summary>

<br>

| Status Code                 | Meaning                                                                 |
| --------------------------- | ----------------------------------------------------------------------- |
| `200 OK`                    | Item successfully added to the cart.                                    |
| `400 Bad Request`           | Validation failed (invalid productId format or qty is not a positive integer). |
| `401 Unauthorized`          | Access token is missing, invalid, expired, or blacklisted.              |
| `403 Forbidden`             | User does not have the required permissions to access this resource.    |
| `500 Internal Server Error` | Server error occurred while adding the item to the cart.                |

</details>

<details>
    <summary><b>Validation Errors</b></summary>

<br>

**Example Response (400 Bad Request):**

```json
{
    "success": false,
    "message": "Validation failed",
    "errors": [
        {
            "field": "productId",
            "message": "Invalid product ID"
        }
    ]
}
```

**Possible Validation Errors:**

| Field       | Error Message                          | Cause                                                      |
| ----------- | -------------------------------------- | ---------------------------------------------------------- |
| `productId` | "Invalid product ID"                   | The productId is not a valid MongoDB ObjectId.             |
| `qty`       | "Quantity must be a positive integer"  | The qty value is not a positive integer (must be > 0).     |

</details>

<br>

---

<br>

> ## Update Item Quantity in Cart

**Description:** <br>
Update the quantity of a specific product in the authenticated user's cart. You can increase, decrease, or remove an item by setting the quantity to 0.

**Purpose:**<br>
Used when a user adjusts item quantities in their shopping cart. Setting quantity to 0 effectively removes the item from the cart.

**Endpoint:** `PATCH /api/v1/cart/items/:productId`

**Authentication:** Required (Private endpoint - User role)

**Headers:**
```
Cookie: accessToken=<your_access_token>
Content-Type: application/json
```

**URL Parameters:**

| Parameter   | Type     | Required | Description                                           |
| ----------- | -------- | -------- | ----------------------------------------------------- |
| `productId` | `string` | Yes      | Valid MongoDB ObjectId of the product to update.      |

**Request Body:**

```json
{
    "qty": 5
}
```

**Request Body Parameters:**

| Parameter | Type     | Required | Description                                                             |
| --------- | -------- | -------- | ----------------------------------------------------------------------- |
| `qty`     | `number` | Yes      | New quantity for the item (must be 0 or greater). Use 0 to remove item. |

**Response Example (200 OK):**

```json
{
    "success": true,
    "message": "Item updated successfully",
    "data": {
        "_id": "676123abc456def789012345",
        "userId": "675a1b2c3d4e5f6789abcdef",
        "items": [
            {
                "productId": "674d5e6f7a8b9c0123456789",
                "quantity": 5,
                "_id": "676123def456abc789012346"
            }
        ],
        "createdAt": "2024-12-17T10:30:00.000Z",
        "updatedAt": "2024-12-17T11:25:00.000Z",
        "__v": 0
    }
}
```

**Response Example - Item Removed (200 OK):**

When `qty` is set to 0, the item is removed from the cart:

```json
{
    "success": true,
    "message": "Item updated successfully",
    "data": {
        "_id": "676123abc456def789012345",
        "userId": "675a1b2c3d4e5f6789abcdef",
        "items": [],
        "createdAt": "2024-12-17T10:30:00.000Z",
        "updatedAt": "2024-12-17T11:30:00.000Z",
        "__v": 0
    }
}
```

<br>
<details>
  <summary><b>Response Details</b></summary>

<br>

| Field                 | Type      | Description                                                      |
| --------------------- | --------- | ---------------------------------------------------------------- |
| `success`             | `boolean` | Indicates whether the request was successful.                    |
| `message`             | `string`  | A human-readable message describing the result.                  |
| `data._id`            | `string`  | Unique identifier for the cart document.                         |
| `data.userId`         | `string`  | ID of the user who owns this cart.                               |
| `data.items`          | `array`   | Updated array of items in the cart.                              |
| `data.items.productId`| `string`  | ID of the product in the cart.                                   |
| `data.items.quantity` | `number`  | Updated quantity of this product in the cart.                    |
| `data.items._id`      | `string`  | Unique identifier for this cart item entry.                      |
| `data.createdAt`      | `string`  | ISO 8601 timestamp when the cart was created.                    |
| `data.updatedAt`      | `string`  | ISO 8601 timestamp when the cart was last modified.              |

</details>

<details>
    <summary><b>Behavior</b></summary>

<br>

**Updating Quantity:**
- The specified quantity replaces the current quantity (not incremented)
- Example: If cart has 3 units and you set `qty: 5`, the final quantity is 5 (not 8)

**Removing Items:**
- Set `qty: 0` to remove an item from the cart
- The item will be completely removed from the `items` array

</details>

<details>
    <summary><b>Usage</b></summary>

<br>

You can use this endpoint to:

- Allow users to increase or decrease item quantities in their cart
- Implement quantity selectors or input fields in the cart page
- Remove items from the cart by setting quantity to 0
- Provide a "Remove" button that sends a request with `qty: 0`

</details>

<details>
    <summary><b>Expected HTTP Status Codes</b></summary>

<br>

| Status Code                 | Meaning                                                                    |
| --------------------------- | -------------------------------------------------------------------------- |
| `200 OK`                    | Item quantity successfully updated or item removed from cart.              |
| `400 Bad Request`           | Validation failed (invalid productId format or qty is not a valid number). |
| `401 Unauthorized`          | Access token is missing, invalid, expired, or blacklisted.                 |
| `403 Forbidden`             | User does not have the required permissions to access this resource.       |
| `404 Not Found`             | The specified product does not exist in the user's cart.                   |
| `500 Internal Server Error` | Server error occurred while updating the item.                             |

</details>

<details>
    <summary><b>Error Responses</b></summary>

<br>

**Item Not Found (404 Not Found):**

```json
{
    "success": false,
    "statusCode": 404,
    "message": "Item not found",
    "errorCode": "ITEM_NOT_FOUND"
}
```

**Validation Error (400 Bad Request):**

```json
{
    "success": false,
    "message": "Validation failed",
    "errors": [
        {
            "field": "qty",
            "message": "Quantity must be a positive integer"
        }
    ]
}
```

**Possible Validation Errors:**

| Field       | Error Message                          | Cause                                                      |
| ----------- | -------------------------------------- | ---------------------------------------------------------- |
| `productId` | "Invalid product ID"                   | The productId in the URL is not a valid MongoDB ObjectId.  |
| `qty`       | "Item quantity is required"            | The qty field is missing from the request body.            |
| `qty`       | "Quantity must be a positive integer"  | The qty value is negative (must be 0 or greater).          |

</details>

<br>

---

<br>

## 🔐 Authentication

All cart endpoints (except health check) require authentication via HTTP-only cookies containing a valid `accessToken`.

**How Authentication Works:**

1. User logs in through the Auth Service and receives an `accessToken` cookie
2. The browser automatically sends this cookie with every request to the Cart Service
3. The Cart Service validates the token and extracts the user information
4. Only users with the `user` role can access cart endpoints

**Authentication Errors:**

| Error Code   | Message                                     | Cause                                    |
| ------------ | ------------------------------------------- | ---------------------------------------- |
| `401`        | "Access token not found, please login again"| No accessToken cookie present            |
| `401`        | "Invalid authentication token"              | Token format is invalid or corrupted     |
| `401`        | "Token expired, please login again"         | Token has passed its expiration time     |
| `401`        | "Token has been invalidated, please login again" | Token was blacklisted (user logged out) |
| `403`        | "You don't have permission to access this resource" | User doesn't have the required role |

<br>

## 📊 Cart Data Model

The cart is stored in MongoDB with the following structure:

```javascript
{
    "_id": "ObjectId",           // Unique cart identifier
    "userId": "ObjectId",         // Reference to the user who owns this cart
    "items": [                    // Array of cart items
        {
            "_id": "ObjectId",    // Unique identifier for this cart item
            "productId": "ObjectId", // Reference to the product
            "quantity": Number    // Quantity of this product (minimum: 1)
        }
    ],
    "createdAt": "ISODate",       // Timestamp when cart was created
    "updatedAt": "ISODate"        // Timestamp when cart was last modified
}
```

**Key Points:**

- Each user can have only one cart
- Cart items are stored as an array within the cart document
- Product details (name, price, image) are fetched from the Product Service when needed
- Empty carts (items: []) are preserved in the database
- Carts are automatically created when a user adds their first item

<br>

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5.0 or higher)
- Redis (for caching, if configured)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cart-service
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (create a `.env` file):
```env
PORT=8002
MONGODB_URI=mongodb://localhost:27017/marketmind-cart
NODE_ENV=development
ACCESS_TOKEN_SECRET=your_access_token_secret
```

4. Start the service:
```bash
npm start
```

The service will be available at `http://localhost:8002`

<br>

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

<br>

## 📝 Error Handling

All endpoints follow a consistent error response format:

```json
{
    "success": false,
    "statusCode": 400,
    "message": "Human-readable error message",
    "errorCode": "ERROR_CODE_CONSTANT",
    "errors": [
        {
            "field": "fieldName",
            "message": "Detailed error message"
        }
    ]
}
```

**Common Error Codes:**

- `VALIDATION_ERROR` - Request validation failed
- `ITEM_NOT_FOUND` - Requested cart item doesn't exist
- `UNAUTHORIZED` - Authentication failed
- `FORBIDDEN` - Insufficient permissions
- `INTERNAL_SERVER_ERROR` - Server-side error occurred

<br>

## 🔧 Environment Variables

| Variable                | Description                              | Required | Default       |
| ----------------------- | ---------------------------------------- | -------- | ------------- |
| `PORT`                  | Port number for the service              | No       | 8002          |
| `MONGODB_URI`           | MongoDB connection string                | Yes      | -             |
| `NODE_ENV`              | Environment (development/production)     | No       | development   |
| `ACCESS_TOKEN_SECRET`   | Secret key for verifying access tokens   | Yes      | -             |
| `REDIS_URL`             | Redis connection URL (if using Redis)    | No       | -             |

<br>

## 📚 Additional Resources

- [MarketMind Platform Documentation](../README.md)
- [Auth Service Documentation](../auth-service/README.md)
- [Product Service Documentation](../product-service/README.md)
- [API Design Guidelines](../docs/api-guidelines.md)

<br>

## 🤝 Contributing

1. Follow the existing code style and conventions
2. Write tests for new features
3. Update documentation when changing APIs
4. Submit pull requests with clear descriptions

<br>

## 📄 License

This project is part of the MarketMind eCommerce platform.

<br>

---

**Need Help?** Contact the development team or open an issue in the repository.