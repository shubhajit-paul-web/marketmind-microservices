# Auth service

The Auth Service is a microservice of the MarketMind eCommerce platform that handles user authentication and authorization, ensuring secure access across the system.

## Overview

This service handles:

- User authentication (login, signup, logout, update account, change or forgot password, token refresh, get users, etc.)
- Role-based access control (RBAC)
- Application and system health monitoring

_The service is designed to operate as a stand-alone microservice within a distributed system._

<br><br>

## ⚙️ API Reference

> All endpoints follow the platform’s authentication and access rules.

<br>

## Health check

**Description:** <br>
Check the application's and system's health status.

**Purpose:**<br>
Used by internal monitoring tools, deployment pipelines, and load balancers to verify the application and system health.

**Endpoint:** `GET /api/v1/health`

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

## Register User

**Description:** <br>
Register a new user account with profile information and optional address details.

**Purpose:**<br>
Enables new users to create an account on the MarketMind platform. Upon successful registration, the user receives authentication tokens (access and refresh tokens) via HTTP-only cookies.

**Endpoint:** `POST /api/v1/auth/register`

**Request Body (multipart/form-data):**

```json
{
    "username": "johndoe123",
    "email": "john.doe@example.com",
    "phoneNumber": "+919876543210",
    "firstName": "John",
    "lastName": "Doe",
    "password": "SecurePass123",
    "role": "user",
    "address": {
        "street": "123 Main Street",
        "city": "Mumbai",
        "state": "Maharashtra",
        "zip": "4000001",
        "country": "india",
        "landmark": "Near Central Park",
        "typeOfAddress": "home",
        "isDefault": true
    }
}
```

**File Upload (Required):**

- Field name: `profilePicture`
- Accepted formats: Images (e.g., JPEG, PNG)

**Response Example (201 Created):**

```json
{
    "success": true,
    "statusCode": 201,
    "message": "Registered successfully",
    "data": {
        "_id": "60d5ec49f1b2c8b1f8e4e1a1",
        "username": "johndoe123",
        "email": "john.doe@example.com",
        "phoneNumber": "+919876543210",
        "fullName": {
            "firstName": "John",
            "lastName": "Doe"
        },
        "role": "user",
        "profilePicture": "https://example.com/uploads/profile-123.jpg",
        "addresses": [
            {
                "_id": "60d5ec49f1b2c8b1f8e4e1a2",
                "street": "123 Main Street",
                "city": "Mumbai",
                "state": "Maharashtra",
                "zip": "4000001",
                "country": "india",
                "landmark": "Near Central Park",
                "typeOfAddress": "home",
                "isDefault": true
            }
        ],
        "createdAt": "2025-01-15T10:30:00.000Z",
        "updatedAt": "2025-01-15T10:30:00.000Z"
    }
}
```

<br>
<details>
  <summary><b>Request Body Fields</b></summary>

<br>

| Field                   | Type      | Required | Description                                                                                                                           |
| ----------------------- | --------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `username`              | `string`  | Yes      | Unique username (5-20 characters, letters, numbers, and underscores only).                                                            |
| `email`                 | `string`  | Yes      | Valid email address.                                                                                                                  |
| `phoneNumber`           | `string`  | Yes      | Valid phone number in international format (e.g., +919876543210).                                                                     |
| `firstName`             | `string`  | Yes      | User's first name (2-30 characters, letters only).                                                                                    |
| `lastName`              | `string`  | Yes      | User's last name (2-30 characters, letters only).                                                                                     |
| `password`              | `string`  | Yes      | Strong password (min 8 chars, uppercase, lowercase, and number required).                                                             |
| `role`                  | `string`  | No       | User role: `user` or `seller`. Default: `user`.                                                                                       |
| `profilePicture`        | `file`    | Yes      | Profile picture image file.                                                                                                           |
| `address`               | `object`  | No       | Optional address object containing location details.                                                                                  |
| `address.street`        | `string`  | Yes\*    | Street address (2-100 characters). \*Required if address object is provided.                                                          |
| `address.city`          | `string`  | Yes\*    | City name (2-50 characters). \*Required if address object is provided.                                                                |
| `address.state`         | `string`  | Yes\*    | State/province name (2-50 characters). \*Required if address object is provided.                                                      |
| `address.zip`           | `string`  | Yes\*    | ZIP/postal code (exactly 7 characters). \*Required if address object is provided.                                                     |
| `address.country`       | `string`  | No       | Country name. Allowed values: `india`, `united states`, `china`, `japan`, `canada`, `russia`, `spain`, `singapore`. Default: `india`. |
| `address.landmark`      | `string`  | No       | Nearby landmark (2-100 characters).                                                                                                   |
| `address.typeOfAddress` | `string`  | No       | Address type: `home` or `work`. Default: `home`.                                                                                      |
| `address.isDefault`     | `boolean` | No       | Whether this is the default address. Default: `false`.                                                                                |

</details>

<details>
    <summary><b>Response Details</b></summary>

<br>

| Field                     | Type      | Description                                                 |
| ------------------------- | --------- | ----------------------------------------------------------- |
| `success`                 | `boolean` | Indicates if the registration was successful.               |
| `statusCode`              | `number`  | HTTP status code (201 for successful creation).             |
| `message`                 | `string`  | Success message.                                            |
| `data._id`                | `string`  | Unique user identifier.                                     |
| `data.username`           | `string`  | Registered username.                                        |
| `data.email`              | `string`  | Registered email address.                                   |
| `data.phoneNumber`        | `string`  | Registered phone number.                                    |
| `data.fullName`           | `object`  | Object containing user's full name.                         |
| `data.fullName.firstName` | `string`  | User's first name.                                          |
| `data.fullName.lastName`  | `string`  | User's last name.                                           |
| `data.role`               | `string`  | Assigned user role.                                         |
| `data.profilePicture`     | `string`  | URL to the uploaded profile picture.                        |
| `data.addresses`          | `array`   | Array of address objects (if provided during registration). |
| `data.createdAt`          | `string`  | ISO 8601 timestamp of account creation.                     |
| `data.updatedAt`          | `string`  | ISO 8601 timestamp of last account update.                  |

**Note:** Authentication tokens (`accessToken` and `refreshToken`) are automatically set as HTTP-only cookies and not included in the response body.

</details>

<details>
    <summary><b>Validation Rules</b></summary>

<br>

- **Username:** Must be unique, 5-20 characters, lowercase, can contain letters, numbers, and underscores only.
- **Email:** Must be a valid email format and unique in the system.
- **Phone Number:** Must be in international format (e.g., +919876543210) with 7-15 digits.
- **First/Last Name:** Only alphabetic characters allowed, 2-30 characters each.
- **Password:** Minimum 8 characters with at least one uppercase letter, one lowercase letter, and one number.
- **Role:** Must be either `user` or `seller` (case-insensitive).
- **ZIP Code:** Must be exactly 7 characters.
- **Country:** Must be one of the supported countries (lowercase).
- **Address Type:** Must be either `home` or `work`.

</details>

<details>
    <summary><b>Usage</b></summary>

<br>

**Example using cURL:**

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: multipart/form-data" \
  -F "username=johndoe123" \
  -F "email=john.doe@example.com" \
  -F "phoneNumber=+919876543210" \
  -F "firstName=John" \
  -F "lastName=Doe" \
  -F "password=SecurePass123" \
  -F "role=user" \
  -F "profilePicture=@/path/to/profile.jpg"
```

**Example using JavaScript (fetch):**

```javascript
const formData = new FormData();
formData.append("username", "johndoe123");
formData.append("email", "john.doe@example.com");
formData.append("phoneNumber", "+919876543210");
formData.append("firstName", "John");
formData.append("lastName", "Doe");
formData.append("password", "SecurePass123");
formData.append("role", "user");
formData.append("profilePicture", fileInput.files[0]);

const response = await fetch("http://localhost:8000/api/v1/auth/register", {
    method: "POST",
    body: formData,
    credentials: "include", // Important for receiving cookies
});

const data = await response.json();
```

</details>

<details>
    <summary><b>Expected HTTP Status Codes</b></summary>

<br>

| Status Code                 | Meaning                                                                 |
| --------------------------- | ----------------------------------------------------------------------- |
| `201 Created`               | User registered successfully. Authentication tokens set in cookies.     |
| `400 Bad Request`           | Validation error (invalid input format, missing required fields, etc.). |
| `409 Conflict`              | User with the provided username, email, or phone number already exists. |
| `500 Internal Server Error` | Server error occurred during registration process.                      |

</details>

<details>
    <summary><b>Error Response Example</b></summary>

<br>

**Validation Error (400 Bad Request):**

```json
{
    "success": false,
    "statusCode": 400,
    "message": "Validation error",
    "errors": [
        {
            "field": "username",
            "message": "Username must be 5-20 characters"
        },
        {
            "field": "password",
            "message": "Weak password: must be at least 8 chars, include uppercase, lowercase & number"
        }
    ]
}
```

**Conflict Error (409 Conflict):**

```json
{
    "success": false,
    "statusCode": 409,
    "message": "User with this email already exists"
}
```

</details>

<br>

## Login User

**Description:** <br>
Authenticate a user and generate access and refresh tokens.

**Purpose:**<br>
Enables registered users to log in to the MarketMind platform using their credentials. Upon successful authentication, the user receives authentication tokens (access and refresh tokens) via HTTP-only cookies.

**Endpoint:** `POST /api/v1/auth/login`

**Request Body (application/json):**

```json
{
    "identifier": "johndoe123",
    "password": "SecurePass123"
}
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "statusCode": 200,
    "message": "Logged in successfully",
    "data": {
        "_id": "60d5ec49f1b2c8b1f8e4e1a1",
        "username": "johndoe123",
        "email": "john.doe@example.com",
        "phoneNumber": "+919876543210",
        "fullName": {
            "firstName": "John",
            "lastName": "Doe"
        },
        "role": "user",
        "profilePicture": "https://example.com/uploads/profile-123.jpg",
        "addresses": [
            {
                "_id": "60d5ec49f1b2c8b1f8e4e1a2",
                "street": "123 Main Street",
                "city": "Mumbai",
                "state": "Maharashtra",
                "zip": "4000001",
                "country": "india",
                "landmark": "Near Central Park",
                "typeOfAddress": "home",
                "isDefault": true
            }
        ],
        "createdAt": "2025-01-15T10:30:00.000Z",
        "updatedAt": "2025-01-15T10:30:00.000Z"
    }
}
```

<br>
<details>
  <summary><b>Request Body Fields</b></summary>

<br>

| Field        | Type     | Required | Description                                                               |
| ------------ | -------- | -------- | ------------------------------------------------------------------------- |
| `identifier` | `string` | Yes      | User identifier - can be username, email, or phone number.                |
| `password`   | `string` | Yes      | User's password (min 8 chars, uppercase, lowercase, and number required). |

</details>

<details>
    <summary><b>Response Details</b></summary>

<br>

| Field                     | Type      | Description                                  |
| ------------------------- | --------- | -------------------------------------------- |
| `success`                 | `boolean` | Indicates if the login was successful.       |
| `statusCode`              | `number`  | HTTP status code (200 for successful login). |
| `message`                 | `string`  | Success message.                             |
| `data._id`                | `string`  | Unique user identifier.                      |
| `data.username`           | `string`  | User's username.                             |
| `data.email`              | `string`  | User's email address.                        |
| `data.phoneNumber`        | `string`  | User's phone number.                         |
| `data.fullName`           | `object`  | Object containing user's full name.          |
| `data.fullName.firstName` | `string`  | User's first name.                           |
| `data.fullName.lastName`  | `string`  | User's last name.                            |
| `data.role`               | `string`  | User's role (user or seller).                |
| `data.profilePicture`     | `string`  | URL to the user's profile picture.           |
| `data.addresses`          | `array`   | Array of user's saved address objects.       |
| `data.createdAt`          | `string`  | ISO 8601 timestamp of account creation.      |
| `data.updatedAt`          | `string`  | ISO 8601 timestamp of last account update.   |

**Note:** Authentication tokens (`accessToken` and `refreshToken`) are automatically set as HTTP-only cookies and not included in the response body.

</details>

<details>
    <summary><b>Validation Rules</b></summary>

<br>

- **Identifier:** Required field. Can be any of the following:
    - Username (case-insensitive)
    - Email address
    - Phone number in international format
- **Password:** Must meet strong password requirements (minimum 8 characters with at least one uppercase letter, one lowercase letter, and one number).

</details>

<details>
    <summary><b>Usage</b></summary>

<br>

**Example using cURL:**

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "johndoe123",
    "password": "SecurePass123"
  }'
```

**Example using JavaScript (fetch):**

```javascript
const response = await fetch("http://localhost:8000/api/v1/auth/login", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        identifier: "johndoe123",
        password: "SecurePass123",
    }),
    credentials: "include", // Important for receiving cookies
});

const data = await response.json();
```

**Alternative identifiers:**

You can use any of these as the identifier:

```javascript
// Using email
{ "identifier": "john.doe@example.com", "password": "SecurePass123" }

// Using phone number
{ "identifier": "+919876543210", "password": "SecurePass123" }

// Using username
{ "identifier": "johndoe123", "password": "SecurePass123" }
```

</details>

<details>
    <summary><b>Expected HTTP Status Codes</b></summary>

<br>

| Status Code                 | Meaning                                                                  |
| --------------------------- | ------------------------------------------------------------------------ |
| `200 OK`                    | User authenticated successfully. Authentication tokens set in cookies.   |
| `400 Bad Request`           | Validation error (missing identifier or password, weak password format). |
| `401 Unauthorized`          | Invalid credentials (incorrect password).                                |
| `404 Not Found`             | User with the provided identifier does not exist.                        |
| `500 Internal Server Error` | Server error occurred during login process.                              |

</details>

<details>
    <summary><b>Error Response Examples</b></summary>

<br>

**Validation Error (400 Bad Request):**

```json
{
    "success": false,
    "statusCode": 400,
    "message": "Validation error",
    "errors": [
        {
            "field": "identifier",
            "message": "Identifier is required"
        },
        {
            "field": "password",
            "message": "Weak password: must be at least 8 chars, include uppercase, lowercase & number"
        }
    ]
}
```

**Invalid Credentials (401 Unauthorized):**

```json
{
    "success": false,
    "statusCode": 401,
    "message": "Invalid credentials",
    "errorCode": "INVALID_CREDENTIALS"
}
```

**User Not Found (404 Not Found):**

```json
{
    "success": false,
    "statusCode": 404,
    "message": "User not found",
    "errorCode": "USER_NOT_FOUND"
}
```

</details>

<br>

## Logout User

**Description:** <br>
Logout an authenticated user and invalidate their refresh token.

**Purpose:**<br>
Enables authenticated users to securely log out from the MarketMind platform. Upon successful logout, the user's refresh token is invalidated in the database, and both authentication tokens (access and refresh tokens) are cleared from cookies.

**Endpoint:** `POST /api/v1/auth/logout`

**Authentication:** Required (User must be logged in)

**Request Headers:**

- Cookies: `accessToken` and `refreshToken` (automatically sent by browser)

**Request Body:** None

**Response Example (200 OK):**

```json
{
    "success": true,
    "statusCode": 200,
    "message": "Logged out successfully"
}
```

<br>
<details>
  <summary><b>Response Details</b></summary>

<br>

| Field        | Type      | Description                                   |
| ------------ | --------- | --------------------------------------------- |
| `success`    | `boolean` | Indicates if the logout was successful.       |
| `statusCode` | `number`  | HTTP status code (200 for successful logout). |
| `message`    | `string`  | Success message confirming logout.            |

**Note:** Both authentication tokens (`accessToken` and `refreshToken`) are cleared from HTTP-only cookies upon successful logout.

</details>

<details>
    <summary><b>Usage</b></summary>

<br>

**Example using cURL:**

```bash
curl -X POST http://localhost:8000/api/v1/auth/logout \
  -H "Cookie: accessToken=<your_access_token>; refreshToken=<your_refresh_token>"
```

**Example using JavaScript (fetch):**

```javascript
const response = await fetch("http://localhost:8000/api/v1/auth/logout", {
    method: "POST",
    credentials: "include", // Important for sending cookies
});

const data = await response.json();
```

**Note:** When using the browser's fetch API with `credentials: 'include'`, cookies are automatically sent with the request. No need to manually set them.

</details>

<details>
    <summary><b>Expected HTTP Status Codes</b></summary>

<br>

| Status Code                 | Meaning                                                                   |
| --------------------------- | ------------------------------------------------------------------------- |
| `200 OK`                    | User logged out successfully. Authentication tokens cleared from cookies. |
| `401 Unauthorized`          | User is not authenticated or access token is invalid/expired.             |
| `500 Internal Server Error` | Server error occurred during logout process.                              |

</details>

<details>
    <summary><b>Error Response Examples</b></summary>

<br>

**Unauthorized (401 Unauthorized):**

```json
{
    "success": false,
    "statusCode": 401,
    "message": "Unauthorized request",
    "errorCode": "UNAUTHORIZED"
}
```

**Invalid Token (401 Unauthorized):**

```json
{
    "success": false,
    "statusCode": 401,
    "message": "Invalid access token",
    "errorCode": "INVALID_TOKEN"
}
```

</details>
