# 🛍️ Product Service

The **Product Service** is a core microservice for the MarketMind eCommerce platform, responsible for managing product catalogs, inventory, and product media assets.

<br>

This service provides a complete solution for:

- **Product Management:** Creating, updating, and deleting products with comprehensive details.
- **Inventory Management:** Managing product stock levels and availability status.
- **Image Management:** Handling product image uploads, updates, and deletion with optimized storage.
- **Product Catalog:** Retrieving public product listings with pagination and filtering capabilities.
- **Seller Operations:** Enabling sellers to manage their own product inventory and details.
- **Authenticated Access:** Secure endpoints requiring valid user authentication and role-based authorization.
- **Health Monitoring:** Exposing a `GET /api/v1/health` endpoint to monitor application and system status.

<br><br>

## ⚙️ API Reference

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

> ## Get all products

**Description:** <br>
Retrieve a paginated list of all available products from the catalog.

**Purpose:**<br>
Used by clients to display product listings, search results, and browse the product catalog with filtering and pagination.

**Endpoint:** `GET /api/v1/products`

**Authentication:** Not required (Public endpoint)

**Query Parameters:**

| Parameter  | Type    | Required | Description                                                   | Default     | Example                 |
| ---------- | ------- | -------- | ------------------------------------------------------------- | ----------- | ----------------------- |
| `page`     | integer | No       | Page number for pagination (starts from 1)                    | `1`         | `?page=1`               |
| `limit`    | integer | No       | Number of products per page (max 100)                         | `10`        | `?limit=20`             |
| `search`   | string  | No       | Search products by name or keyword                            | -           | `?search=laptop`        |
| `category` | string  | No       | Filter products by category (case-insensitive)                | -           | `?category=electronics` |
| `sortBy`   | string  | No       | Sort results by field (`name`, `price`, `createdAt`, `stock`) | `createdAt` | `?sortBy=price`         |
| `order`    | string  | No       | Sort direction (`asc` for ascending, `desc` for descending)   | `desc`      | `?order=asc`            |

**Response Example (200 OK):**

```json
{
    "success": true,
    "message": "Products fetched successfully",
    "data": [
        {
            "_id": "67890abcdef123456789012",
            "name": "Wireless Bluetooth Headphones",
            "description": "High-quality wireless headphones with noise cancellation and 30-hour battery life",
            "category": "electronics",
            "stock": 45,
            "price": {
                "amount": 4999,
                "discountPrice": 3999,
                "currency": "INR"
            },
            "images": [
                {
                    "url": "https://cdn.example.com/products/headphones-full.jpg",
                    "thumbnail": "https://cdn.example.com/products/headphones-thumb.jpg",
                    "id": "img_123"
                }
            ],
            "seller": "55555555555555555555555",
            "isActive": true,
            "createdAt": "2025-12-20T10:30:00.000Z",
            "updatedAt": "2025-12-20T10:30:00.000Z"
        }
    ],
    "pagination": {
        "currentPage": 1,
        "totalPages": 5,
        "totalRecords": 47,
        "recordsPerPage": 10,
        "hasNextPage": true,
        "hasPreviousPage": false
    }
}
```

<br>
<details>
  <summary><b>Response Details</b></summary>

<br>

| Field                        | Type            | Description                                  |
| ---------------------------- | --------------- | -------------------------------------------- |
| `success`                    | `boolean`       | Request success status                       |
| `message`                    | `string`        | Response message                             |
| `data`                       | `array<object>` | Array of product objects                     |
| `data[].\_id`                | `string`        | Unique product identifier (MongoDB ObjectID) |
| `data[].name`                | `string`        | Product name (10-250 characters)             |
| `data[].description`         | `string`        | Product description (up to 1500 characters)  |
| `data[].category`            | `string`        | Product category (lowercase)                 |
| `data[].stock`               | `integer`       | Available stock quantity                     |
| `data[].price.amount`        | `number`        | Original price amount                        |
| `data[].price.discountPrice` | `number`        | Discounted price (optional)                  |
| `data[].price.currency`      | `string`        | Currency code (`INR` or `USD`)               |
| `data[].images`              | `array<object>` | Array of product images                      |
| `data[].images[].url`        | `string`        | Full-size image URL                          |
| `data[].images[].thumbnail`  | `string`        | Thumbnail image URL                          |
| `data[].images[].id`         | `string`        | Image identifier                             |
| `data[].seller`              | `string`        | Seller ID (MongoDB ObjectID)                 |
| `data[].isActive`            | `boolean`       | Product active status                        |
| `data[].createdAt`           | `string`        | ISO timestamp of product creation            |
| `data[].updatedAt`           | `string`        | ISO timestamp of last product update         |
| `pagination.currentPage`     | `integer`       | Current page number                          |
| `pagination.totalPages`      | `integer`       | Total number of pages available              |
| `pagination.totalRecords`    | `integer`       | Total number of products in database         |
| `pagination.recordsPerPage`  | `integer`       | Number of records per page                   |
| `pagination.hasNextPage`     | `boolean`       | Whether a next page exists                   |
| `pagination.hasPreviousPage` | `boolean`       | Whether a previous page exists               |

</details>

<details>
    <summary><b>Usage Examples</b></summary>

<br>

**Get first page of products:**

```
GET /api/v1/products?page=1&limit=10
```

**Search for specific products:**

```
GET /api/v1/products?search=laptop&limit=20
```

**Filter by category:**

```
GET /api/v1/products?category=electronics&page=1
```

**Get products sorted by price (lowest to highest):**

```
GET /api/v1/products?sortBy=price&order=asc
```

</details>

<details>
    <summary><b>Expected HTTP Status Codes</b></summary>

<br>

| Status Code                 | Meaning                                       |
| --------------------------- | --------------------------------------------- |
| `200 OK`                    | Products retrieved successfully               |
| `400 Bad Request`           | Invalid query parameters                      |
| `500 Internal Server Error` | Server error occurred while fetching products |

</details>

<br>

---

<br>

> ## Create product

**Description:** <br>
Create a new product with details and optional images (Seller only).

**Purpose:**<br>
Used by sellers to add new products to their catalog with comprehensive product information and media assets.

**Endpoint:** `POST /api/v1/products`

**Authentication:** Required (Seller role)

**Request Headers:**

```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**Request Body:**

| Field           | Type    | Required | Description                                                       | Example                      |
| --------------- | ------- | -------- | ----------------------------------------------------------------- | ---------------------------- |
| `name`          | string  | Yes      | Product name (10-250 characters)                                  | "Laptop Stand"               |
| `description`   | string  | No       | Product description (up to 1500 characters)                       | "Adjustable laptop stand..." |
| `category`      | string  | Yes      | Product category (2-50 characters, lowercase)                     | "office-supplies"            |
| `stock`         | integer | No       | Available stock quantity (0-1,000,000, default: 0)                | 100                          |
| `priceAmount`   | number  | Yes      | Price amount (0.01 - 10,000,000)                                  | 1999.99                      |
| `discountPrice` | number  | No       | Discounted price (must be less than priceAmount, min 1% discount) | 1499.99                      |
| `priceCurrency` | string  | No       | Currency code (`INR` or `USD`, default: `INR`)                    | "INR"                        |
| `images`        | file[]  | No       | Product images (up to 5 images, multipart/form-data)              | binary file data             |

**Response Example (201 Created):**

```json
{
    "success": true,
    "message": "Product created successfully",
    "data": {
        "_id": "67890abcdef123456789012",
        "name": "Laptop Stand",
        "description": "Adjustable laptop stand for ergonomic workspace setup",
        "category": "office-supplies",
        "stock": 100,
        "price": {
            "amount": 1999.99,
            "discountPrice": 1499.99,
            "currency": "INR"
        },
        "images": [
            {
                "url": "https://cdn.example.com/products/stand-full.jpg",
                "thumbnail": "https://cdn.example.com/products/stand-thumb.jpg",
                "id": "img_456"
            }
        ],
        "seller": "55555555555555555555555",
        "isActive": true,
        "createdAt": "2025-12-25T12:00:00.000Z",
        "updatedAt": "2025-12-25T12:00:00.000Z"
    }
}
```

<br>
<details>
  <summary><b>Validation Rules</b></summary>

<br>

- **Name:** Required, 10-250 characters, alphanumeric with spaces and basic punctuation
- **Category:** Required, 2-50 characters, lowercase, alphanumeric with hyphens
- **Price Amount:** Required, positive number between 0.01 and 10,000,000
- **Discount Price:** Optional, must be less than price amount with minimum 1% discount
- **Stock:** Optional, non-negative integer between 0 and 1,000,000
- **Images:** Optional, up to 5 images per product

</details>

<details>
    <summary><b>Usage with cURL</b></summary>

<br>

```bash
curl -X POST http://localhost:8001/api/v1/products \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "name=Wireless Mouse" \
  -F "description=Ergonomic wireless mouse with USB receiver" \
  -F "category=electronics" \
  -F "stock=150" \
  -F "priceAmount=799.99" \
  -F "discountPrice=599.99" \
  -F "priceCurrency=INR" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

</details>

<details>
    <summary><b>Expected HTTP Status Codes</b></summary>

<br>

| Status Code                 | Meaning                                      |
| --------------------------- | -------------------------------------------- |
| `201 Created`               | Product created successfully                 |
| `400 Bad Request`           | Invalid request body or validation failed    |
| `401 Unauthorized`          | Missing or invalid authentication token      |
| `403 Forbidden`             | User does not have seller role               |
| `500 Internal Server Error` | Server error occurred while creating product |

</details>

<br>

---

<br>

> ## Get product by ID

**Description:** <br>
Retrieve detailed information about a specific product.

**Purpose:**<br>
Used by clients to fetch complete product details for display on product detail pages.

**Endpoint:** `GET /api/v1/products/:productId`

**Authentication:** Not required (Public endpoint)

**Path Parameters:**

| Parameter   | Type   | Description                     |
| ----------- | ------ | ------------------------------- |
| `productId` | string | MongoDB ObjectID of the product |

**Response Example (200 OK):**

```json
{
    "success": true,
    "message": "Product fetched successfully",
    "data": {
        "_id": "67890abcdef123456789012",
        "name": "Wireless Bluetooth Headphones",
        "description": "High-quality wireless headphones with active noise cancellation and 30-hour battery life. Compatible with all major devices.",
        "category": "electronics",
        "stock": 45,
        "price": {
            "amount": 4999,
            "discountPrice": 3999,
            "currency": "INR"
        },
        "images": [
            {
                "url": "https://cdn.example.com/products/headphones-full.jpg",
                "thumbnail": "https://cdn.example.com/products/headphones-thumb.jpg",
                "id": "img_123"
            },
            {
                "url": "https://cdn.example.com/products/headphones-side.jpg",
                "thumbnail": "https://cdn.example.com/products/headphones-side-thumb.jpg",
                "id": "img_124"
            }
        ],
        "seller": "55555555555555555555555",
        "isActive": true,
        "createdAt": "2025-12-20T10:30:00.000Z",
        "updatedAt": "2025-12-20T10:30:00.000Z"
    }
}
```

<br>
<details>
    <summary><b>Expected HTTP Status Codes</b></summary>

<br>

| Status Code                 | Meaning                                      |
| --------------------------- | -------------------------------------------- |
| `200 OK`                    | Product retrieved successfully               |
| `400 Bad Request`           | Invalid product ID format                    |
| `404 Not Found`             | Product not found                            |
| `500 Internal Server Error` | Server error occurred while fetching product |

</details>

<br>

---

<br>

> ## Update product

**Description:** <br>
Update product details (Seller only, must be product owner).

**Purpose:**<br>
Used by sellers to modify product information such as name, description, price, category, and stock.

**Endpoint:** `PATCH /api/v1/products/:productId`

**Authentication:** Required (Seller role, product owner)

**Request Headers:**

```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Path Parameters:**

| Parameter   | Type   | Description                     |
| ----------- | ------ | ------------------------------- |
| `productId` | string | MongoDB ObjectID of the product |

**Request Body (All fields optional):**

| Field           | Type    | Description                                      | Example                  |
| --------------- | ------- | ------------------------------------------------ | ------------------------ |
| `name`          | string  | Product name (10-250 characters)                 | "Updated Product"        |
| `description`   | string  | Product description (up to 1500 characters)      | "Updated description..." |
| `category`      | string  | Product category (2-50 characters, lowercase)    | "office-supplies"        |
| `stock`         | integer | Available stock quantity (0-1,000,000)           | 150                      |
| `priceAmount`   | number  | Price amount (0.01 - 10,000,000)                 | 2499.99                  |
| `discountPrice` | number  | Discounted price (must be less than priceAmount) | 1999.99                  |
| `priceCurrency` | string  | Currency code (`INR` or `USD`)                   | "INR"                    |
| `isActive`      | boolean | Product active status                            | true                     |

**Response Example (200 OK):**

```json
{
    "success": true,
    "message": "Product updated successfully",
    "data": {
        "_id": "67890abcdef123456789012",
        "name": "Premium Wireless Headphones",
        "description": "Updated description with more features",
        "category": "electronics",
        "stock": 60,
        "price": {
            "amount": 5499,
            "discountPrice": 4299,
            "currency": "INR"
        },
        "images": [
            {
                "url": "https://cdn.example.com/products/headphones-full.jpg",
                "thumbnail": "https://cdn.example.com/products/headphones-thumb.jpg",
                "id": "img_123"
            }
        ],
        "seller": "55555555555555555555555",
        "isActive": true,
        "createdAt": "2025-12-20T10:30:00.000Z",
        "updatedAt": "2025-12-25T15:45:00.000Z"
    }
}
```

<br>
<details>
    <summary><b>Expected HTTP Status Codes</b></summary>

<br>

| Status Code                 | Meaning                                            |
| --------------------------- | -------------------------------------------------- |
| `200 OK`                    | Product updated successfully                       |
| `400 Bad Request`           | Invalid request body or validation failed          |
| `401 Unauthorized`          | Missing or invalid authentication token            |
| `403 Forbidden`             | User is not the product owner or lacks seller role |
| `404 Not Found`             | Product not found                                  |
| `500 Internal Server Error` | Server error occurred while updating product       |

</details>

<br>

---

<br>

> ## Delete product

**Description:** <br>
Delete a product and remove all associated images (Seller only, must be product owner).

**Purpose:**<br>
Used by sellers to remove products from their catalog. Deletion removes the product and all associated image files from storage.

**Endpoint:** `DELETE /api/v1/products/:productId`

**Authentication:** Required (Seller role, product owner)

**Request Headers:**

```
Authorization: Bearer {accessToken}
```

**Path Parameters:**

| Parameter   | Type   | Description                     |
| ----------- | ------ | ------------------------------- |
| `productId` | string | MongoDB ObjectID of the product |

**Response Example (200 OK):**

```json
{
    "success": true,
    "message": "Product deleted successfully",
    "data": null
}
```

<br>
<details>
    <summary><b>Expected HTTP Status Codes</b></summary>

<br>

| Status Code                 | Meaning                                            |
| --------------------------- | -------------------------------------------------- |
| `200 OK`                    | Product deleted successfully                       |
| `400 Bad Request`           | Invalid product ID format                          |
| `401 Unauthorized`          | Missing or invalid authentication token            |
| `403 Forbidden`             | User is not the product owner or lacks seller role |
| `404 Not Found`             | Product not found                                  |
| `500 Internal Server Error` | Server error occurred while deleting product       |

</details>

<br>

---

<br>

> ## Get seller's products

**Description:** <br>
Retrieve paginated list of products created by the authenticated seller.

**Purpose:**<br>
Used by sellers to view and manage their own product inventory with pagination and filtering options.

**Endpoint:** `GET /api/v1/products/mine`

**Authentication:** Required (Seller role)

**Request Headers:**

```
Authorization: Bearer {accessToken}
```

**Query Parameters:**

| Parameter | Type    | Required | Description                                                   | Default     | Example          |
| --------- | ------- | -------- | ------------------------------------------------------------- | ----------- | ---------------- |
| `page`    | integer | No       | Page number for pagination (starts from 1)                    | `1`         | `?page=1`        |
| `limit`   | integer | No       | Number of products per page (max 100)                         | `10`        | `?limit=20`      |
| `search`  | string  | No       | Search own products by name or keyword                        | -           | `?search=laptop` |
| `sortBy`  | string  | No       | Sort results by field (`name`, `price`, `createdAt`, `stock`) | `createdAt` | `?sortBy=price`  |
| `order`   | string  | No       | Sort direction (`asc` for ascending, `desc` for descending)   | `desc`      | `?order=asc`     |

**Response Example (200 OK):**

```json
{
    "success": true,
    "message": "Products fetched successfully",
    "data": [
        {
            "_id": "67890abcdef123456789012",
            "name": "Wireless Headphones",
            "description": "High-quality wireless headphones...",
            "category": "electronics",
            "stock": 45,
            "price": {
                "amount": 4999,
                "discountPrice": 3999,
                "currency": "INR"
            },
            "images": [...],
            "seller": "55555555555555555555555",
            "isActive": true,
            "createdAt": "2025-12-20T10:30:00.000Z",
            "updatedAt": "2025-12-20T10:30:00.000Z"
        }
    ],
    "pagination": {
        "currentPage": 1,
        "totalPages": 2,
        "totalRecords": 12,
        "recordsPerPage": 10,
        "hasNextPage": true,
        "hasPreviousPage": false
    }
}
```

<br>
<details>
    <summary><b>Expected HTTP Status Codes</b></summary>

<br>

| Status Code                 | Meaning                                       |
| --------------------------- | --------------------------------------------- |
| `200 OK`                    | Seller products retrieved successfully        |
| `400 Bad Request`           | Invalid query parameters                      |
| `401 Unauthorized`          | Missing or invalid authentication token       |
| `403 Forbidden`             | User does not have seller role                |
| `500 Internal Server Error` | Server error occurred while fetching products |

</details>

<br>

---

<br>

> ## Get seller's specific product

**Description:** <br>
Retrieve detailed information about a specific product owned by the authenticated seller.

**Purpose:**<br>
Used by sellers to view detailed information about their own product for verification and management purposes.

**Endpoint:** `GET /api/v1/products/:productId/mine`

**Authentication:** Required (Seller role)

**Request Headers:**

```
Authorization: Bearer {accessToken}
```

**Path Parameters:**

| Parameter   | Type   | Description                     |
| ----------- | ------ | ------------------------------- |
| `productId` | string | MongoDB ObjectID of the product |

**Response Example (200 OK):**

```json
{
    "success": true,
    "message": "Product fetched successfully",
    "data": {
        "_id": "67890abcdef123456789012",
        "name": "Wireless Bluetooth Headphones",
        "description": "High-quality wireless headphones with active noise cancellation...",
        "category": "electronics",
        "stock": 45,
        "price": {
            "amount": 4999,
            "discountPrice": 3999,
            "currency": "INR"
        },
        "images": [...],
        "seller": "55555555555555555555555",
        "isActive": true,
        "createdAt": "2025-12-20T10:30:00.000Z",
        "updatedAt": "2025-12-20T10:30:00.000Z"
    }
}
```

<br>
<details>
    <summary><b>Expected HTTP Status Codes</b></summary>

<br>

| Status Code                 | Meaning                                            |
| --------------------------- | -------------------------------------------------- |
| `200 OK`                    | Product retrieved successfully                     |
| `400 Bad Request`           | Invalid product ID format                          |
| `401 Unauthorized`          | Missing or invalid authentication token            |
| `403 Forbidden`             | User is not the product owner or lacks seller role |
| `404 Not Found`             | Product not found                                  |
| `500 Internal Server Error` | Server error occurred while fetching product       |

</details>

<br>

---

<br>

## 🖼️ Image Management Endpoints

<br>

> ## Add product images

**Description:** <br>
Add new images to an existing product without removing existing ones (Seller only, must be product owner).

**Purpose:**<br>
Used by sellers to add additional product images to enhance product listings. Maximum 5 images per product.

**Endpoint:** `POST /api/v1/products/:productId/images`

**Authentication:** Required (Seller role, product owner)

**Request Headers:**

```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**Path Parameters:**

| Parameter   | Type   | Description                     |
| ----------- | ------ | ------------------------------- |
| `productId` | string | MongoDB ObjectID of the product |

**Request Body:**

| Field    | Type   | Required | Description                                | Example          |
| -------- | ------ | -------- | ------------------------------------------ | ---------------- |
| `images` | file[] | Yes      | Product images (up to 5 total per product) | binary file data |

**Response Example (200 OK):**

```json
{
    "success": true,
    "message": "Product image uploaded successfully",
    "data": {
        "_id": "67890abcdef123456789012",
        "name": "Wireless Headphones",
        "category": "electronics",
        "stock": 45,
        "price": {
            "amount": 4999,
            "discountPrice": 3999,
            "currency": "INR"
        },
        "images": [
            {
                "url": "https://cdn.example.com/products/headphones-full.jpg",
                "thumbnail": "https://cdn.example.com/products/headphones-thumb.jpg",
                "id": "img_123"
            },
            {
                "url": "https://cdn.example.com/products/headphones-side.jpg",
                "thumbnail": "https://cdn.example.com/products/headphones-side-thumb.jpg",
                "id": "img_124"
            }
        ],
        "seller": "55555555555555555555555",
        "isActive": true,
        "createdAt": "2025-12-20T10:30:00.000Z",
        "updatedAt": "2025-12-25T15:45:00.000Z"
    }
}
```

<br>
<details>
    <summary><b>Expected HTTP Status Codes</b></summary>

<br>

| Status Code                 | Meaning                                               |
| --------------------------- | ----------------------------------------------------- |
| `200 OK`                    | Images added successfully                             |
| `400 Bad Request`           | Invalid product ID or no images provided              |
| `401 Unauthorized`          | Missing or invalid authentication token               |
| `403 Forbidden`             | User is not the product owner or image limit exceeded |
| `404 Not Found`             | Product not found                                     |
| `500 Internal Server Error` | Server error occurred while uploading images          |

</details>

<br>

---

<br>

> ## Update product image

**Description:** <br>
Replace a specific product image identified by imageId (Seller only, must be product owner).

**Purpose:**<br>
Used by sellers to replace or update a single product image without affecting other images.

**Endpoint:** `PATCH /api/v1/products/:productId/images/:imageId`

**Authentication:** Required (Seller role, product owner)

**Request Headers:**

```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**Path Parameters:**

| Parameter   | Type   | Description                     |
| ----------- | ------ | ------------------------------- |
| `productId` | string | MongoDB ObjectID of the product |
| `imageId`   | string | Image identifier to replace     |

**Request Body:**

| Field   | Type | Required | Description       | Example          |
| ------- | ---- | -------- | ----------------- | ---------------- |
| `image` | file | Yes      | New product image | binary file data |

**Response Example (200 OK):**

```json
{
    "success": true,
    "message": "Product image updated successfully",
    "data": {
        "_id": "67890abcdef123456789012",
        "name": "Wireless Headphones",
        "category": "electronics",
        "stock": 45,
        "images": [
            {
                "url": "https://cdn.example.com/products/headphones-new.jpg",
                "thumbnail": "https://cdn.example.com/products/headphones-new-thumb.jpg",
                "id": "img_124"
            }
        ],
        "seller": "55555555555555555555555",
        "isActive": true,
        "updatedAt": "2025-12-25T16:00:00.000Z"
    }
}
```

<br>
<details>
    <summary><b>Expected HTTP Status Codes</b></summary>

<br>

| Status Code                 | Meaning                                    |
| --------------------------- | ------------------------------------------ |
| `200 OK`                    | Image updated successfully                 |
| `400 Bad Request`           | Invalid product ID or image ID             |
| `401 Unauthorized`          | Missing or invalid authentication token    |
| `403 Forbidden`             | User is not the product owner              |
| `404 Not Found`             | Product or image not found                 |
| `500 Internal Server Error` | Server error occurred while updating image |

</details>

<br>

---

<br>

> ## Replace all product images

**Description:** <br>
Remove all existing product images and replace them with new ones (Seller only, must be product owner).

**Purpose:**<br>
Used by sellers to completely update the product image gallery, removing old images and uploading new ones in one operation.

**Endpoint:** `PUT /api/v1/products/:productId/images`

**Authentication:** Required (Seller role, product owner)

**Request Headers:**

```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**Path Parameters:**

| Parameter   | Type   | Description                     |
| ----------- | ------ | ------------------------------- |
| `productId` | string | MongoDB ObjectID of the product |

**Request Body:**

| Field    | Type   | Required | Description                         | Example          |
| -------- | ------ | -------- | ----------------------------------- | ---------------- |
| `images` | file[] | Yes      | New product images (up to 5 images) | binary file data |

**Response Example (200 OK):**

```json
{
    "success": true,
    "message": "All product images replaced successfully",
    "data": {
        "_id": "67890abcdef123456789012",
        "name": "Wireless Headphones",
        "category": "electronics",
        "images": [
            {
                "url": "https://cdn.example.com/products/headphones-new1.jpg",
                "thumbnail": "https://cdn.example.com/products/headphones-new1-thumb.jpg",
                "id": "img_201"
            },
            {
                "url": "https://cdn.example.com/products/headphones-new2.jpg",
                "thumbnail": "https://cdn.example.com/products/headphones-new2-thumb.jpg",
                "id": "img_202"
            }
        ],
        "seller": "55555555555555555555555",
        "isActive": true,
        "updatedAt": "2025-12-25T16:15:00.000Z"
    }
}
```

<br>
<details>
    <summary><b>Expected HTTP Status Codes</b></summary>

<br>

| Status Code                 | Meaning                                      |
| --------------------------- | -------------------------------------------- |
| `200 OK`                    | All images replaced successfully             |
| `400 Bad Request`           | Invalid product ID or no images provided     |
| `401 Unauthorized`          | Missing or invalid authentication token      |
| `403 Forbidden`             | User is not the product owner                |
| `404 Not Found`             | Product not found                            |
| `500 Internal Server Error` | Server error occurred while replacing images |

</details>

<br>

---

<br>

> ## Delete product image

**Description:** <br>
Remove a specific product image identified by imageId (Seller only, must be product owner).

**Purpose:**<br>
Used by sellers to remove individual product images from the product's image gallery.

**Endpoint:** `DELETE /api/v1/products/:productId/images/:imageId`

**Authentication:** Required (Seller role, product owner)

**Request Headers:**

```
Authorization: Bearer {accessToken}
```

**Path Parameters:**

| Parameter   | Type   | Description                     |
| ----------- | ------ | ------------------------------- |
| `productId` | string | MongoDB ObjectID of the product |
| `imageId`   | string | Image identifier to delete      |

**Response Example (200 OK):**

```json
{
    "success": true,
    "message": "Product image removed successfully",
    "data": {
        "_id": "67890abcdef123456789012",
        "name": "Wireless Headphones",
        "category": "electronics",
        "images": [
            {
                "url": "https://cdn.example.com/products/headphones-full.jpg",
                "thumbnail": "https://cdn.example.com/products/headphones-thumb.jpg",
                "id": "img_123"
            }
        ],
        "seller": "55555555555555555555555",
        "isActive": true,
        "updatedAt": "2025-12-25T16:30:00.000Z"
    }
}
```

<br>
<details>
    <summary><b>Expected HTTP Status Codes</b></summary>

<br>

| Status Code                 | Meaning                                    |
| --------------------------- | ------------------------------------------ |
| `200 OK`                    | Image deleted successfully                 |
| `400 Bad Request`           | Invalid product ID or image ID             |
| `401 Unauthorized`          | Missing or invalid authentication token    |
| `403 Forbidden`             | User is not the product owner              |
| `404 Not Found`             | Product or image not found                 |
| `500 Internal Server Error` | Server error occurred while deleting image |

</details>

<br>

---

<br>

## 📋 Error Handling

All API endpoints follow a consistent error response format. In case of errors, the response includes a status code, message, and error details:

**Error Response Example:**

```json
{
    "success": false,
    "message": "Validation failed",
    "errors": [
        {
            "field": "name",
            "message": "Product name must be between 10-250 characters"
        }
    ]
}
```

**Common HTTP Status Codes:**

| Status Code                 | Description                                     |
| --------------------------- | ----------------------------------------------- |
| `200 OK`                    | Request successful                              |
| `201 Created`               | Resource created successfully                   |
| `400 Bad Request`           | Invalid request parameters or validation failed |
| `401 Unauthorized`          | Authentication required or invalid token        |
| `403 Forbidden`             | Authenticated but insufficient permissions      |
| `404 Not Found`             | Requested resource not found                    |
| `500 Internal Server Error` | Unexpected server error                         |

<br>

---

<br>

## 🔐 Authentication & Authorization

### Roles

- **Seller:** Can create, update, and delete their own products; manage product images
- **User/Buyer:** Can view public products and search the catalog
- **Admin:** Full access to all operations (if applicable)

### Access Token

All private endpoints require an access token passed in the `Authorization` header:

```
Authorization: Bearer {accessToken}
```

The access token must be a valid JWT (JSON Web Token) issued by the authentication service.

<br>

---

<br>

## 📚 Additional Resources

- **Base URL:** `http://localhost:8001/api/v1`
- **Documentation Version:** 1.0.0
- **Last Updated:** December 25, 2025

For more information or support, contact the development team.
