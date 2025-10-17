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

<br>

## Get Current User Profile

**Description:** <br>
Retrieve the profile information of the currently authenticated user.

**Purpose:**<br>
Enables authenticated users to view their own profile information, including personal details, addresses, and account metadata. This endpoint is commonly used to display user information in the UI or verify the current session.

**Endpoint:** `GET /api/v1/users/me`

**Authentication:** Required (User must be logged in)

**Request Headers:**

- Cookies: `accessToken` (automatically sent by browser)

**Request Body:** None

**Response Example (200 OK):**

```json
{
    "success": true,
    "statusCode": 200,
    "message": "User profile fetched successfully",
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
                "isDefault": true,
                "createdAt": "2025-01-15T10:30:00.000Z",
                "updatedAt": "2025-01-15T10:30:00.000Z"
            }
        ],
        "createdAt": "2025-01-15T10:30:00.000Z",
        "updatedAt": "2025-01-15T10:30:00.000Z"
    }
}
```

<br>
<details>
  <summary><b>Response Details</b></summary>

<br>

| Field                            | Type      | Description                                      |
| -------------------------------- | --------- | ------------------------------------------------ |
| `success`                        | `boolean` | Indicates if the request was successful.         |
| `statusCode`                     | `number`  | HTTP status code (200 for successful retrieval). |
| `message`                        | `string`  | Success message.                                 |
| `data._id`                       | `string`  | Unique user identifier.                          |
| `data.username`                  | `string`  | User's username.                                 |
| `data.email`                     | `string`  | User's email address.                            |
| `data.phoneNumber`               | `string`  | User's phone number.                             |
| `data.fullName`                  | `object`  | Object containing user's full name.              |
| `data.fullName.firstName`        | `string`  | User's first name.                               |
| `data.fullName.lastName`         | `string`  | User's last name.                                |
| `data.role`                      | `string`  | User's role (user or seller).                    |
| `data.profilePicture`            | `string`  | URL to the user's profile picture.               |
| `data.addresses`                 | `array`   | Array of user's saved address objects.           |
| `data.addresses[]._id`           | `string`  | Unique identifier for the address.               |
| `data.addresses[].street`        | `string`  | Street address.                                  |
| `data.addresses[].city`          | `string`  | City name.                                       |
| `data.addresses[].state`         | `string`  | State/province name.                             |
| `data.addresses[].zip`           | `string`  | ZIP/postal code.                                 |
| `data.addresses[].country`       | `string`  | Country name.                                    |
| `data.addresses[].landmark`      | `string`  | Nearby landmark (optional).                      |
| `data.addresses[].typeOfAddress` | `string`  | Address type (home or work).                     |
| `data.addresses[].isDefault`     | `boolean` | Whether this is the default address.             |
| `data.addresses[].createdAt`     | `string`  | ISO 8601 timestamp of address creation.          |
| `data.addresses[].updatedAt`     | `string`  | ISO 8601 timestamp of last address update.       |
| `data.createdAt`                 | `string`  | ISO 8601 timestamp of account creation.          |
| `data.updatedAt`                 | `string`  | ISO 8601 timestamp of last account update.       |

**Note:** Sensitive fields like `password` and `refreshToken` are automatically excluded from the response.

</details>

<details>
    <summary><b>Usage</b></summary>

<br>

**Example using cURL:**

```bash
curl -X GET http://localhost:8000/api/v1/users/me \
  -H "Cookie: accessToken=<your_access_token>"
```

**Example using JavaScript (fetch):**

```javascript
const response = await fetch("http://localhost:8000/api/v1/users/me", {
    method: "GET",
    credentials: "include", // Important for sending cookies
});

const data = await response.json();
console.log(data.data); // User profile data
```

**Example using Axios:**

```javascript
const response = await axios.get("http://localhost:8000/api/v1/users/me", {
    withCredentials: true, // Important for sending cookies
});

console.log(response.data.data); // User profile data
```

</details>

<details>
    <summary><b>Expected HTTP Status Codes</b></summary>

<br>

| Status Code                 | Meaning                                                       |
| --------------------------- | ------------------------------------------------------------- |
| `200 OK`                    | User profile retrieved successfully.                          |
| `401 Unauthorized`          | User is not authenticated or access token is invalid/expired. |
| `500 Internal Server Error` | Server error occurred while fetching the profile.             |

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

**Expired Token (401 Unauthorized):**

```json
{
    "success": false,
    "statusCode": 401,
    "message": "Access token has expired",
    "errorCode": "TOKEN_EXPIRED"
}
```

</details>

<br>

## Add User Address

**Description:** <br>
Add a new address to the authenticated user's profile.

**Purpose:**<br>
Enables authenticated users to add additional addresses to their account. Users can add multiple addresses (e.g., home, work) and mark one as default. This is useful for managing shipping addresses in an eCommerce platform.

**Endpoint:** `POST /api/v1/users/me/addresses`

**Authentication:** Required (User must be logged in)

**Request Headers:**

- Cookies: `accessToken` (automatically sent by browser)
- Content-Type: `application/json`

**Request Body (application/json):**

```json
{
    "street": "456 Park Avenue",
    "city": "Delhi",
    "state": "Delhi",
    "zip": "1100001",
    "country": "india",
    "landmark": "Near Metro Station",
    "typeOfAddress": "work",
    "isDefault": false
}
```

**Response Example (201 Created):**

```json
{
    "success": true,
    "statusCode": 201,
    "message": "Address added successfully",
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
                "isDefault": true,
                "createdAt": "2025-01-15T10:30:00.000Z",
                "updatedAt": "2025-01-15T10:30:00.000Z"
            },
            {
                "_id": "60d5ec49f1b2c8b1f8e4e1a3",
                "street": "456 Park Avenue",
                "city": "Delhi",
                "state": "Delhi",
                "zip": "1100001",
                "country": "india",
                "landmark": "Near Metro Station",
                "typeOfAddress": "work",
                "isDefault": false,
                "createdAt": "2025-01-16T14:20:00.000Z",
                "updatedAt": "2025-01-16T14:20:00.000Z"
            }
        ],
        "createdAt": "2025-01-15T10:30:00.000Z",
        "updatedAt": "2025-01-16T14:20:00.000Z"
    }
}
```

<br>
<details>
  <summary><b>Request Body Fields</b></summary>

<br>

| Field           | Type      | Required | Description                                                                                                                           |
| --------------- | --------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `street`        | `string`  | Yes      | Street address (2-100 characters).                                                                                                    |
| `city`          | `string`  | Yes      | City name (2-50 characters).                                                                                                          |
| `state`         | `string`  | Yes      | State/province name (2-50 characters).                                                                                                |
| `zip`           | `string`  | Yes      | ZIP/postal code (exactly 7 characters).                                                                                               |
| `country`       | `string`  | No       | Country name. Allowed values: `india`, `united states`, `china`, `japan`, `canada`, `russia`, `spain`, `singapore`. Default: `india`. |
| `landmark`      | `string`  | No       | Nearby landmark (2-100 characters).                                                                                                   |
| `typeOfAddress` | `string`  | No       | Address type: `home` or `work`. Default: `home`.                                                                                      |
| `isDefault`     | `boolean` | No       | Whether this is the default address. Default: `false`.                                                                                |

</details>

<details>
    <summary><b>Response Details</b></summary>

<br>

| Field                            | Type      | Description                                            |
| -------------------------------- | --------- | ------------------------------------------------------ |
| `success`                        | `boolean` | Indicates if the request was successful.               |
| `statusCode`                     | `number`  | HTTP status code (201 for successful creation).        |
| `message`                        | `string`  | Success message.                                       |
| `data._id`                       | `string`  | Unique user identifier.                                |
| `data.username`                  | `string`  | User's username.                                       |
| `data.email`                     | `string`  | User's email address.                                  |
| `data.phoneNumber`               | `string`  | User's phone number.                                   |
| `data.fullName`                  | `object`  | Object containing user's full name.                    |
| `data.fullName.firstName`        | `string`  | User's first name.                                     |
| `data.fullName.lastName`         | `string`  | User's last name.                                      |
| `data.role`                      | `string`  | User's role (user or seller).                          |
| `data.profilePicture`            | `string`  | URL to the user's profile picture.                     |
| `data.addresses`                 | `array`   | Array of all user's addresses (including the new one). |
| `data.addresses[]._id`           | `string`  | Unique identifier for the address.                     |
| `data.addresses[].street`        | `string`  | Street address.                                        |
| `data.addresses[].city`          | `string`  | City name.                                             |
| `data.addresses[].state`         | `string`  | State/province name.                                   |
| `data.addresses[].zip`           | `string`  | ZIP/postal code.                                       |
| `data.addresses[].country`       | `string`  | Country name.                                          |
| `data.addresses[].landmark`      | `string`  | Nearby landmark (optional).                            |
| `data.addresses[].typeOfAddress` | `string`  | Address type (home or work).                           |
| `data.addresses[].isDefault`     | `boolean` | Whether this is the default address.                   |
| `data.addresses[].createdAt`     | `string`  | ISO 8601 timestamp of address creation.                |
| `data.addresses[].updatedAt`     | `string`  | ISO 8601 timestamp of last address update.             |
| `data.createdAt`                 | `string`  | ISO 8601 timestamp of account creation.                |
| `data.updatedAt`                 | `string`  | ISO 8601 timestamp of last account update.             |

**Note:** The response includes the complete updated user profile with all addresses.

</details>

<details>
    <summary><b>Validation Rules</b></summary>

<br>

- **Street:** Required, 2-100 characters. Leading/trailing whitespace is trimmed and cleaned.
- **City:** Required, 2-50 characters. Leading/trailing whitespace is trimmed and cleaned.
- **State:** Required, 2-50 characters. Leading/trailing whitespace is trimmed and cleaned.
- **ZIP Code:** Required, must be exactly 7 characters.
- **Country:** Optional, must be one of the supported countries (lowercase): `india`, `united states`, `china`, `japan`, `canada`, `russia`, `spain`, `singapore`.
- **Landmark:** Optional, 2-100 characters if provided. Leading/trailing whitespace is trimmed and cleaned.
- **Type of Address:** Optional, must be either `home` or `work` (case-insensitive).
- **Is Default:** Optional, must be a boolean value.

</details>

<details>
    <summary><b>Usage</b></summary>

<br>

**Example using cURL:**

```bash
curl -X POST http://localhost:8000/api/v1/users/me/addresses \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=<your_access_token>" \
  -d '{
    "street": "456 Park Avenue",
    "city": "Delhi",
    "state": "Delhi",
    "zip": "1100001",
    "country": "india",
    "landmark": "Near Metro Station",
    "typeOfAddress": "work",
    "isDefault": false
  }'
```

**Example using JavaScript (fetch):**

```javascript
const response = await fetch("http://localhost:8000/api/v1/users/me/addresses", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        street: "456 Park Avenue",
        city: "Delhi",
        state: "Delhi",
        zip: "1100001",
        country: "india",
        landmark: "Near Metro Station",
        typeOfAddress: "work",
        isDefault: false,
    }),
    credentials: "include", // Important for sending cookies
});

const data = await response.json();
console.log(data.data.addresses); // Array of all addresses
```

**Example using Axios:**

```javascript
const response = await axios.post(
    "http://localhost:8000/api/v1/users/me/addresses",
    {
        street: "456 Park Avenue",
        city: "Delhi",
        state: "Delhi",
        zip: "1100001",
        country: "india",
        landmark: "Near Metro Station",
        typeOfAddress: "work",
        isDefault: false,
    },
    {
        withCredentials: true, // Important for sending cookies
    }
);

console.log(response.data.data.addresses); // Array of all addresses
```

**Minimal Request (only required fields):**

```javascript
{
    "street": "456 Park Avenue",
    "city": "Delhi",
    "state": "Delhi",
    "zip": "1100001"
}
```

</details>

<details>
    <summary><b>Expected HTTP Status Codes</b></summary>

<br>

| Status Code                 | Meaning                                                                                                  |
| --------------------------- | -------------------------------------------------------------------------------------------------------- |
| `201 Created`               | Address added successfully to user's profile.                                                            |
| `400 Bad Request`           | Validation error (invalid input format, missing required fields, etc.) or address limit reached (max 5). |
| `401 Unauthorized`          | User is not authenticated or access token is invalid/expired.                                            |
| `500 Internal Server Error` | Server error occurred while adding the address.                                                          |

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
            "field": "street",
            "message": "Street required"
        },
        {
            "field": "zip",
            "message": "ZIP must be 7 chars"
        },
        {
            "field": "country",
            "message": "Invalid country"
        }
    ]
}
```

**Address Limit Reached (400 Bad Request):**

```json
{
    "success": false,
    "statusCode": 400,
    "message": "Address limit reached. You can add up to 5 addresses only",
    "errorCode": "ADDRESS_LIMIT_REACHED"
}
```

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

<br>

## Get User Address

**Description:** <br>
Retrieve a specific address from the authenticated user's address list.

**Purpose:**<br>
Enables authenticated users to fetch details of a specific address by its ID. This is useful for viewing, editing, or verifying a particular address before performing operations like checkout or shipping.

**Endpoint:** `GET /api/v1/users/me/addresses/:id`

**Authentication:** Required (User must be logged in)

**Request Headers:**

- Cookies: `accessToken` (automatically sent by browser)

**URL Parameters:**

- `id` (required): The unique identifier of the address to retrieve

**Request Body:** None

**Response Example (200 OK):**

```json
{
    "success": true,
    "statusCode": 200,
    "message": "User address fetched successfully",
    "data": {
        "_id": "60d5ec49f1b2c8b1f8e4e1a2",
        "street": "123 Main Street",
        "city": "Mumbai",
        "state": "Maharashtra",
        "zip": "4000001",
        "country": "india",
        "landmark": "Near Central Park",
        "typeOfAddress": "home",
        "isDefault": true,
        "createdAt": "2025-01-15T10:30:00.000Z",
        "updatedAt": "2025-01-15T10:30:00.000Z"
    }
}
```

<br>
<details>
  <summary><b>Response Details</b></summary>

<br>

| Field                | Type      | Description                                      |
| -------------------- | --------- | ------------------------------------------------ |
| `success`            | `boolean` | Indicates if the request was successful.         |
| `statusCode`         | `number`  | HTTP status code (200 for successful retrieval). |
| `message`            | `string`  | Success message.                                 |
| `data._id`           | `string`  | Unique identifier for the address.               |
| `data.street`        | `string`  | Street address.                                  |
| `data.city`          | `string`  | City name.                                       |
| `data.state`         | `string`  | State/province name.                             |
| `data.zip`           | `string`  | ZIP/postal code.                                 |
| `data.country`       | `string`  | Country name.                                    |
| `data.landmark`      | `string`  | Nearby landmark (if provided).                   |
| `data.typeOfAddress` | `string`  | Address type (home or work).                     |
| `data.isDefault`     | `boolean` | Whether this is the default address.             |
| `data.createdAt`     | `string`  | ISO 8601 timestamp of address creation.          |
| `data.updatedAt`     | `string`  | ISO 8601 timestamp of last address update.       |

</details>

<details>
    <summary><b>Usage</b></summary>

<br>

**Example using cURL:**

```bash
curl -X GET http://localhost:8000/api/v1/users/me/addresses/60d5ec49f1b2c8b1f8e4e1a2 \
  -H "Cookie: accessToken=<your_access_token>"
```

**Example using JavaScript (fetch):**

```javascript
const addressId = "60d5ec49f1b2c8b1f8e4e1a2";
const response = await fetch(`http://localhost:8000/api/v1/users/me/addresses/${addressId}`, {
    method: "GET",
    credentials: "include", // Important for sending cookies
});

const data = await response.json();
console.log(data.data); // Address object
```

**Example using Axios:**

```javascript
const addressId = "60d5ec49f1b2c8b1f8e4e1a2";
const response = await axios.get(`http://localhost:8000/api/v1/users/me/addresses/${addressId}`, {
    withCredentials: true, // Important for sending cookies
});

console.log(response.data.data); // Address object
```

</details>

<details>
    <summary><b>Expected HTTP Status Codes</b></summary>

<br>

| Status Code                 | Meaning                                                       |
| --------------------------- | ------------------------------------------------------------- |
| `200 OK`                    | Address retrieved successfully.                               |
| `401 Unauthorized`          | User is not authenticated or access token is invalid/expired. |
| `404 Not Found`             | Address with the specified ID does not exist.                 |
| `500 Internal Server Error` | Server error occurred while fetching the address.             |

</details>

<details>
    <summary><b>Error Response Examples</b></summary>

<br>

**Address Not Found (404 Not Found):**

```json
{
    "success": false,
    "statusCode": 404,
    "message": "Address not found",
    "errorCode": "ADDRESS_NOT_FOUND"
}
```

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

<br>

## Update User Address

**Description:** <br>
Update a specific address in the authenticated user's address list.

**Purpose:**<br>
Enables authenticated users to modify details of an existing address. Users can update any field of the address including street, city, state, ZIP code, country, landmark, address type, or default status. At least one field must be provided in the request.

**Endpoint:** `PATCH /api/v1/users/me/addresses/:id`

**Authentication:** Required (User must be logged in)

**Request Headers:**

- Cookies: `accessToken` (automatically sent by browser)
- Content-Type: `application/json`

**URL Parameters:**

- `id` (required): The unique identifier of the address to update

**Request Body (application/json):**

```json
{
    "street": "789 Updated Street",
    "city": "Bangalore",
    "state": "Karnataka",
    "zip": "5600001",
    "country": "india",
    "landmark": "Near Tech Park",
    "typeOfAddress": "work",
    "isDefault": true
}
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "statusCode": 200,
    "message": "User address updated successfully",
    "data": {
        "_id": "60d5ec49f1b2c8b1f8e4e1a2",
        "street": "789 Updated Street",
        "city": "Bangalore",
        "state": "Karnataka",
        "zip": "5600001",
        "country": "india",
        "landmark": "Near Tech Park",
        "typeOfAddress": "work",
        "isDefault": true,
        "createdAt": "2025-01-15T10:30:00.000Z",
        "updatedAt": "2025-01-16T15:45:00.000Z"
    }
}
```

<br>
<details>
  <summary><b>Request Body Fields</b></summary>

<br>

**Note:** All fields are optional, but at least one field must be provided.

| Field           | Type      | Required | Description                                                                                                         |
| --------------- | --------- | -------- | ------------------------------------------------------------------------------------------------------------------- |
| `street`        | `string`  | No       | Street address (2-100 characters).                                                                                  |
| `city`          | `string`  | No       | City name (2-50 characters).                                                                                        |
| `state`         | `string`  | No       | State/province name (2-50 characters).                                                                              |
| `zip`           | `string`  | No       | ZIP/postal code (exactly 7 characters).                                                                             |
| `country`       | `string`  | No       | Country name. Allowed values: `india`, `united states`, `china`, `japan`, `canada`, `russia`, `spain`, `singapore`. |
| `landmark`      | `string`  | No       | Nearby landmark (2-100 characters).                                                                                 |
| `typeOfAddress` | `string`  | No       | Address type: `home` or `work`.                                                                                     |
| `isDefault`     | `boolean` | No       | Whether this is the default address.                                                                                |

</details>

<details>
    <summary><b>Response Details</b></summary>

<br>

| Field                | Type      | Description                                   |
| -------------------- | --------- | --------------------------------------------- |
| `success`            | `boolean` | Indicates if the request was successful.      |
| `statusCode`         | `number`  | HTTP status code (200 for successful update). |
| `message`            | `string`  | Success message.                              |
| `data._id`           | `string`  | Unique identifier for the address.            |
| `data.street`        | `string`  | Updated street address.                       |
| `data.city`          | `string`  | Updated city name.                            |
| `data.state`         | `string`  | Updated state/province name.                  |
| `data.zip`           | `string`  | Updated ZIP/postal code.                      |
| `data.country`       | `string`  | Updated country name.                         |
| `data.landmark`      | `string`  | Updated landmark (if provided).               |
| `data.typeOfAddress` | `string`  | Updated address type (home or work).          |
| `data.isDefault`     | `boolean` | Updated default address status.               |
| `data.createdAt`     | `string`  | ISO 8601 timestamp of address creation.       |
| `data.updatedAt`     | `string`  | ISO 8601 timestamp of last address update.    |

**Note:** Only the updated address object is returned, not the entire user profile.

</details>

<details>
    <summary><b>Validation Rules</b></summary>

<br>

- **At least one field required:** The request must include at least one field to update. Empty requests will be rejected.
- **Street:** If provided, must be 2-100 characters. Leading/trailing whitespace is trimmed and cleaned.
- **City:** If provided, must be 2-50 characters. Leading/trailing whitespace is trimmed and cleaned.
- **State:** If provided, must be 2-50 characters. Leading/trailing whitespace is trimmed and cleaned.
- **ZIP Code:** If provided, must be exactly 7 characters.
- **Country:** If provided, must be one of the supported countries (lowercase).
- **Landmark:** If provided, must be 2-100 characters. Leading/trailing whitespace is trimmed and cleaned.
- **Type of Address:** If provided, must be either `home` or `work` (case-insensitive).
- **Is Default:** If provided, must be a boolean value.

</details>

<details>
    <summary><b>Usage</b></summary>

<br>

**Example using cURL:**

```bash
curl -X PATCH http://localhost:8000/api/v1/users/me/addresses/60d5ec49f1b2c8b1f8e4e1a2 \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=<your_access_token>" \
  -d '{
    "street": "789 Updated Street",
    "city": "Bangalore",
    "isDefault": true
  }'
```

**Example using JavaScript (fetch):**

```javascript
const addressId = "60d5ec49f1b2c8b1f8e4e1a2";
const response = await fetch(`http://localhost:8000/api/v1/users/me/addresses/${addressId}`, {
    method: "PATCH",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        street: "789 Updated Street",
        city: "Bangalore",
        state: "Karnataka",
        isDefault: true,
    }),
    credentials: "include", // Important for sending cookies
});

const data = await response.json();
console.log(data.data); // Updated address object
```

**Example using Axios:**

```javascript
const addressId = "60d5ec49f1b2c8b1f8e4e1a2";
const response = await axios.patch(
    `http://localhost:8000/api/v1/users/me/addresses/${addressId}`,
    {
        street: "789 Updated Street",
        city: "Bangalore",
        state: "Karnataka",
        isDefault: true,
    },
    {
        withCredentials: true, // Important for sending cookies
    }
);

console.log(response.data.data); // Updated address object
```

**Partial Update (only specific fields):**

```javascript
// Update only the landmark and address type
{
    "landmark": "Near New Shopping Mall",
    "typeOfAddress": "home"
}
```

</details>

<details>
    <summary><b>Expected HTTP Status Codes</b></summary>

<br>

| Status Code                 | Meaning                                                       |
| --------------------------- | ------------------------------------------------------------- |
| `200 OK`                    | Address updated successfully.                                 |
| `400 Bad Request`           | Validation error or no fields provided to update.             |
| `401 Unauthorized`          | User is not authenticated or access token is invalid/expired. |
| `404 Not Found`             | Address with the specified ID does not exist.                 |
| `500 Internal Server Error` | Server error occurred while updating the address.             |

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
            "field": "street",
            "message": "Street 2-100 chars"
        },
        {
            "field": "zip",
            "message": "ZIP must be 7 chars"
        }
    ]
}
```

**Missing Required Fields (400 Bad Request):**

```json
{
    "success": false,
    "statusCode": 400,
    "message": "Missing required fields",
    "errorCode": "MISSING_REQUIRED_FIELDS"
}
```

**Address Not Found (404 Not Found):**

```json
{
    "success": false,
    "statusCode": 404,
    "message": "Address not found",
    "errorCode": "ADDRESS_NOT_FOUND"
}
```

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

<br>

## Delete User Address

**Description:** <br>
Delete a specific address from the authenticated user's address list.

**Purpose:**<br>
Enables authenticated users to remove an address from their profile. This is useful for cleaning up old or unused addresses. Users can maintain up to 5 addresses in their profile.

**Endpoint:** `DELETE /api/v1/users/me/addresses/:id`

**Authentication:** Required (User must be logged in)

**Request Headers:**

- Cookies: `accessToken` (automatically sent by browser)

**URL Parameters:**

- `id` (required): The unique identifier of the address to delete

**Request Body:** None

**Response Example (200 OK):**

```json
{
    "success": true,
    "statusCode": 200,
    "message": "User address deleted successfully"
}
```

<br>
<details>
  <summary><b>Response Details</b></summary>

<br>

| Field        | Type      | Description                                     |
| ------------ | --------- | ----------------------------------------------- |
| `success`    | `boolean` | Indicates if the request was successful.        |
| `statusCode` | `number`  | HTTP status code (200 for successful deletion). |
| `message`    | `string`  | Success message confirming deletion.            |

**Note:** The response does not include the deleted address data. The address is permanently removed from the user's profile.

</details>

<details>
    <summary><b>Usage</b></summary>

<br>

**Example using cURL:**

```bash
curl -X DELETE http://localhost:8000/api/v1/users/me/addresses/60d5ec49f1b2c8b1f8e4e1a2 \
  -H "Cookie: accessToken=<your_access_token>"
```

**Example using JavaScript (fetch):**

```javascript
const addressId = "60d5ec49f1b2c8b1f8e4e1a2";
const response = await fetch(`http://localhost:8000/api/v1/users/me/addresses/${addressId}`, {
    method: "DELETE",
    credentials: "include", // Important for sending cookies
});

const data = await response.json();
console.log(data.message); // Success message
```

**Example using Axios:**

```javascript
const addressId = "60d5ec49f1b2c8b1f8e4e1a2";
const response = await axios.delete(
    `http://localhost:8000/api/v1/users/me/addresses/${addressId}`,
    {
        withCredentials: true, // Important for sending cookies
    }
);

console.log(response.data.message); // Success message
```

</details>

<details>
    <summary><b>Expected HTTP Status Codes</b></summary>

<br>

| Status Code                 | Meaning                                                       |
| --------------------------- | ------------------------------------------------------------- |
| `200 OK`                    | Address deleted successfully.                                 |
| `401 Unauthorized`          | User is not authenticated or access token is invalid/expired. |
| `404 Not Found`             | Address with the specified ID does not exist.                 |
| `500 Internal Server Error` | Server error occurred while deleting the address.             |

</details>

<details>
    <summary><b>Error Response Examples</b></summary>

<br>

**Address Not Found (404 Not Found):**

```json
{
    "success": false,
    "statusCode": 404,
    "message": "Address not found",
    "errorCode": "ADDRESS_NOT_FOUND"
}
```

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

<br>

## Update User Profile

**Description:** <br>
Update the profile information of the currently authenticated user.

**Purpose:**<br>
Enables authenticated users to modify their profile details including email, phone number, first name, last name, role, and profile picture. Users can update one or more fields in a single request. This is useful for keeping user information up-to-date.

**Endpoint:** `PATCH /api/v1/users/me`

**Authentication:** Required (User must be logged in)

**Request Headers:**

- Cookies: `accessToken` (automatically sent by browser)
- Content-Type: `multipart/form-data`

**Request Body (multipart/form-data):**

```json
{
    "email": "newemail@example.com",
    "phoneNumber": "+919876543210",
    "firstName": "John",
    "lastName": "Smith",
    "role": "seller"
}
```

**File Upload (Optional):**

- Field name: `profilePicture`
- Accepted formats: Images (e.g., JPEG, PNG)

**Response Example (200 OK):**

```json
{
    "success": true,
    "statusCode": 200,
    "message": "User profile updated successfully",
    "data": {
        "_id": "60d5ec49f1b2c8b1f8e4e1a1",
        "username": "johndoe123",
        "email": "newemail@example.com",
        "phoneNumber": "+919876543210",
        "fullName": {
            "firstName": "John",
            "lastName": "Smith"
        },
        "role": "seller",
        "profilePicture": "https://example.com/uploads/profile-updated-123.jpg",
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
                "isDefault": true,
                "createdAt": "2025-01-15T10:30:00.000Z",
                "updatedAt": "2025-01-15T10:30:00.000Z"
            }
        ],
        "createdAt": "2025-01-15T10:30:00.000Z",
        "updatedAt": "2025-01-16T16:20:00.000Z"
    }
}
```

<br>
<details>
  <summary><b>Request Body Fields</b></summary>

<br>

**Note:** All fields are optional, but at least one field must be provided.

| Field            | Type     | Required | Description                                                                        |
| ---------------- | -------- | -------- | ---------------------------------------------------------------------------------- |
| `email`          | `string` | No       | Valid email address.                                                               |
| `phoneNumber`    | `string` | No       | Valid phone number in international format (e.g., +919876543210).                  |
| `firstName`      | `string` | No       | User's first name (2-30 characters, letters only).                                 |
| `lastName`       | `string` | No       | User's last name (2-30 characters, letters only).                                  |
| `role`           | `string` | No       | User role: `user` or `seller`.                                                     |
| `profilePicture` | `file`   | No       | New profile picture image file. If provided, replaces the existing profile image. |

</details>

<details>
    <summary><b>Response Details</b></summary>

<br>

| Field                     | Type      | Description                                 |
| ------------------------- | --------- | ------------------------------------------- |
| `success`                 | `boolean` | Indicates if the request was successful.    |
| `statusCode`              | `number`  | HTTP status code (200 for successful)       |
| `message`                 | `string`  | Success message.                            |
| `data._id`                | `string`  | Unique user identifier.                     |
| `data.username`           | `string`  | User's username (cannot be changed).        |
| `data.email`              | `string`  | Updated email address.                      |
| `data.phoneNumber`        | `string`  | Updated phone number.                       |
| `data.fullName`           | `object`  | Object containing user's full name.         |
| `data.fullName.firstName` | `string`  | Updated first name.                         |
| `data.fullName.lastName`  | `string`  | Updated last name.                          |
| `data.role`               | `string`  | Updated user role.                          |
| `data.profilePicture`     | `string`  | URL to the updated profile picture.         |
| `data.addresses`          | `array`   | Array of user's saved address objects.      |
| `data.createdAt`          | `string`  | ISO 8601 timestamp of account creation.     |
| `data.updatedAt`          | `string`  | ISO 8601 timestamp of last account update.  |

**Note:** The response includes the complete updated user profile.

</details>

<details>
    <summary><b>Validation Rules</b></summary>

<br>

- **At least one field required:** The request must include at least one field to update.
- **Email:** If provided, must be a valid email format. Will be checked for uniqueness.
- **Phone Number:** If provided, must be in international format (e.g., +919876543210) with 7-15 digits.
- **First/Last Name:** If provided, only alphabetic characters allowed, 2-30 characters each. Automatically capitalized.
- **Role:** If provided, must be either `user` or `seller` (case-insensitive).
- **Profile Picture:** If provided, must be a valid image file.

**Note:** The username cannot be changed through this endpoint.

</details>

<details>
    <summary><b>Usage</b></summary>

<br>

**Example using cURL:**

```bash
curl -X PATCH http://localhost:8000/api/v1/users/me \
  -H "Cookie: accessToken=<your_access_token>" \
  -F "email=newemail@example.com" \
  -F "firstName=John" \
  -F "lastName=Smith" \
  -F "profilePicture=@/path/to/new-profile.jpg"
```

**Example using JavaScript (fetch with FormData):**

```javascript
const formData = new FormData();
formData.append("email", "newemail@example.com");
formData.append("firstName", "John");
formData.append("lastName", "Smith");
formData.append("phoneNumber", "+919876543210");
formData.append("role", "seller");

// Optionally add profile picture
if (fileInput.files[0]) {
    formData.append("profilePicture", fileInput.files[0]);
}

const response = await fetch("http://localhost:8000/api/v1/users/me", {
    method: "PATCH",
    body: formData,
    credentials: "include", // Important for sending cookies
});

const data = await response.json();
console.log(data.data); // Updated user profile
```

**Example using Axios:**

```javascript
const formData = new FormData();
formData.append("email", "newemail@example.com");
formData.append("firstName", "John");
formData.append("lastName", "Smith");

const response = await axios.patch("http://localhost:8000/api/v1/users/me", formData, {
    withCredentials: true, // Important for sending cookies
    headers: {
        "Content-Type": "multipart/form-data",
    },
});

console.log(response.data.data); // Updated user profile
```

**Partial Update (only specific fields):**

```bash
# Update only email
curl -X PATCH http://localhost:8000/api/v1/users/me \
  -H "Cookie: accessToken=<your_access_token>" \
  -F "email=newemail@example.com"
```

</details>

<details>
    <summary><b>Expected HTTP Status Codes</b></summary>

<br>

| Status Code                 | Meaning                                                       |
| --------------------------- | ------------------------------------------------------------- |
| `200 OK`                    | User profile updated successfully.                            |
| `400 Bad Request`           | Validation error or no fields provided to update.             |
| `401 Unauthorized`          | User is not authenticated or access token is invalid/expired. |
| `409 Conflict`              | Email or phone number already exists for another user.        |
| `500 Internal Server Error` | Server error occurred while updating the profile.             |

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
            "field": "email",
            "message": "Please provide a valid email id"
        },
        {
            "field": "firstName",
            "message": "First name must be 2-30 characters"
        }
    ]
}
```

**Conflict Error (409 Conflict):**

```json
{
    "success": false,
    "statusCode": 409,
    "message": "User with this email already exists",
    "errorCode": "EMAIL_ALREADY_EXISTS"
}
```

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

<br>

## Change Password

**Description:** <br>
Change the password for the currently authenticated user.

**Purpose:**<br>
Enables authenticated users to update their account password for security purposes. The user must provide their current password for verification along with the new password. Upon successful password change, new authentication tokens are generated and set in cookies.

**Endpoint:** `PATCH /api/v1/auth/password`

**Authentication:** Required (User must be logged in)

**Request Headers:**

- Cookies: `accessToken` (automatically sent by browser)
- Content-Type: `application/json`

**Request Body (application/json):**

```json
{
    "oldPassword": "CurrentPass123",
    "newPassword": "NewSecurePass456"
}
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "statusCode": 200,
    "message": "Password updated successfully"
}
```

<br>
<details>
  <summary><b>Request Body Fields</b></summary>

<br>

| Field         | Type     | Required | Description                                                                       |
| ------------- | -------- | -------- | --------------------------------------------------------------------------------- |
| `oldPassword` | `string` | Yes      | User's current password for verification.                                         |
| `newPassword` | `string` | Yes      | New password (min 8 chars, uppercase, lowercase, and number required).            |

</details>

<details>
    <summary><b>Response Details</b></summary>

<br>

| Field        | Type      | Description                                  |
| ------------ | --------- | -------------------------------------------- |
| `success`    | `boolean` | Indicates if the request was successful.     |
| `statusCode` | `number`  | HTTP status code (200 for successful update).|
| `message`    | `string`  | Success message confirming password change.  |

**Note:** New authentication tokens (`accessToken` and `refreshToken`) are automatically generated and set as HTTP-only cookies. The user remains logged in with the new credentials.

</details>

<details>
    <summary><b>Validation Rules</b></summary>

<br>

- **Old Password:** Required field. Cannot be empty.
- **New Password:** Required field. Must meet strong password requirements:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
- **Password Verification:** The old password must match the current password in the database.
- **Password Difference:** The new password should be different from the old password (recommended but not enforced).

</details>

<details>
    <summary><b>Usage</b></summary>

<br>

**Example using cURL:**

```bash
curl -X PATCH http://localhost:8000/api/v1/auth/password \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=<your_access_token>" \
  -d '{
    "oldPassword": "CurrentPass123",
    "newPassword": "NewSecurePass456"
  }'
```

**Example using JavaScript (fetch):**

```javascript
const response = await fetch("http://localhost:8000/api/v1/auth/password", {
    method: "PATCH",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        oldPassword: "CurrentPass123",
        newPassword: "NewSecurePass456",
    }),
    credentials: "include", // Important for sending cookies
});

const data = await response.json();
console.log(data.message); // Success message
```

**Example using Axios:**

```javascript
const response = await axios.patch(
    "http://localhost:8000/api/v1/auth/password",
    {
        oldPassword: "CurrentPass123",
        newPassword: "NewSecurePass456",
    },
    {
        withCredentials: true, // Important for sending cookies
    }
);

console.log(response.data.message); // Success message
```

</details>

<details>
    <summary><b>Expected HTTP Status Codes</b></summary>

<br>

| Status Code                 | Meaning                                                                |
| --------------------------- | ---------------------------------------------------------------------- |
| `200 OK`                    | Password changed successfully. New tokens set in cookies.              |
| `400 Bad Request`           | Validation error (missing fields, weak password).                      |
| `401 Unauthorized`          | Invalid old password or user not authenticated.                        |
| `500 Internal Server Error` | Server error occurred while changing the password.                     |

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
            "field": "oldPassword",
            "message": "Old password is required"
        },
        {
            "field": "newPassword",
            "message": "Weak password: must be at least 8 chars, include uppercase, lowercase & number"
        }
    ]
}
```

**Invalid Old Password (401 Unauthorized):**

```json
{
    "success": false,
    "statusCode": 401,
    "message": "Invalid old password",
    "errorCode": "INVALID_PASSWORD"
}
```

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

<br>

## Refresh Access Token

**Description:** <br>
Generate a new access token using a valid refresh token.

**Purpose:**<br>
Enables clients to obtain a new access token when the current one has expired, without requiring the user to log in again. This endpoint uses the refresh token stored in HTTP-only cookies to authenticate the request and issue a new access token, maintaining a seamless user session.

**Endpoint:** `GET /api/v1/auth/refresh-token`

**Authentication:** Public (Requires valid refresh token cookie)

**Request Headers:**

- Cookies: `refreshToken` (automatically sent by browser)

**Request Body:** None

**Response Example (200 OK):**

```json
{
    "success": true,
    "statusCode": 200,
    "message": "Access token generated successfully"
}
```

<br>
<details>
  <summary><b>Response Details</b></summary>

<br>

| Field        | Type      | Description                                                   |
| ------------ | --------- | ------------------------------------------------------------- |
| `success`    | `boolean` | Indicates if the request was successful.                      |
| `statusCode` | `number`  | HTTP status code (200 for successful token generation).       |
| `message`    | `string`  | Success message confirming access token generation.           |

**Note:** The new `accessToken` is automatically set as an HTTP-only cookie and not included in the response body. The refresh token remains unchanged.

</details>

<details>
    <summary><b>How It Works</b></summary>

<br>

1. **Client sends request:** The browser automatically includes the `refreshToken` cookie in the request.
2. **Token verification:** The server validates the refresh token against the database and checks its expiry.
3. **User lookup:** The server retrieves the user associated with the refresh token.
4. **Token generation:** A new access token is generated for the user.
5. **Cookie update:** The new access token is set as an HTTP-only cookie with appropriate expiration.
6. **Response:** The server returns a success response.

**Token Lifecycle:**

- **Access Token:** Short-lived (typically 15 minutes to 1 hour). Used for authenticating API requests.
- **Refresh Token:** Long-lived (typically 7-30 days). Used only for generating new access tokens.

**When to use:**

- When the access token has expired (401 Unauthorized with TOKEN_EXPIRED error).
- Proactively before the access token expires (e.g., during app initialization).
- After detecting authentication errors in API responses.

</details>

<details>
    <summary><b>Usage</b></summary>

<br>

**Example using cURL:**

```bash
curl -X GET http://localhost:8000/api/v1/auth/refresh-token \
  -H "Cookie: refreshToken=<your_refresh_token>"
```

**Example using JavaScript (fetch):**

```javascript
const response = await fetch("http://localhost:8000/api/v1/auth/refresh-token", {
    method: "GET",
    credentials: "include", // Important for sending cookies
});

const data = await response.json();
console.log(data.message); // Success message
// New access token is now set in cookies
```

**Example using Axios:**

```javascript
const response = await axios.get("http://localhost:8000/api/v1/auth/refresh-token", {
    withCredentials: true, // Important for sending cookies
});

console.log(response.data.message); // Success message
// New access token is now set in cookies
```

**Example with automatic retry on token expiration:**

```javascript
// Axios interceptor to automatically refresh token on 401 errors
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Refresh the access token
                await axios.get("http://localhost:8000/api/v1/auth/refresh-token", {
                    withCredentials: true,
                });

                // Retry the original request
                return axios(originalRequest);
            } catch (refreshError) {
                // Refresh token is invalid, redirect to login
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);
```

</details>

<details>
    <summary><b>Expected HTTP Status Codes</b></summary>

<br>

| Status Code                 | Meaning                                                                 |
| --------------------------- | ----------------------------------------------------------------------- |
| `200 OK`                    | New access token generated successfully and set in cookies.             |
| `401 Unauthorized`          | Refresh token is missing, invalid, expired, or doesn't match the database. |
| `404 Not Found`             | User associated with the refresh token no longer exists.                |
| `500 Internal Server Error` | Server error occurred while generating the access token.                |

</details>

<details>
    <summary><b>Error Response Examples</b></summary>

<br>

**Missing Refresh Token (401 Unauthorized):**

```json
{
    "success": false,
    "statusCode": 401,
    "message": "Unauthorized request",
    "errorCode": "UNAUTHORIZED"
}
```

**Invalid Refresh Token (401 Unauthorized):**

```json
{
    "success": false,
    "statusCode": 401,
    "message": "Invalid refresh token",
    "errorCode": "INVALID_TOKEN"
}
```

**Expired Refresh Token (401 Unauthorized):**

```json
{
    "success": false,
    "statusCode": 401,
    "message": "Refresh token has expired",
    "errorCode": "TOKEN_EXPIRED"
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

<details>
    <summary><b>Security Considerations</b></summary>

<br>

- **HTTP-Only Cookies:** Both access and refresh tokens are stored in HTTP-only cookies to prevent XSS attacks.
- **Secure Flag:** In production, cookies should be sent only over HTTPS connections.
- **SameSite Attribute:** Cookies should use SameSite attribute to prevent CSRF attacks.
- **Token Rotation:** Consider implementing refresh token rotation for enhanced security (new refresh token issued with each refresh).
- **Token Revocation:** Refresh tokens can be invalidated in the database during logout or when suspicious activity is detected.
- **Expiration:** Always set appropriate expiration times for both tokens.

**Best Practices:**

1. Store tokens only in HTTP-only cookies, never in localStorage or sessionStorage.
2. Implement automatic token refresh before expiration.
3. Handle token refresh failures gracefully by redirecting to login.
4. Monitor and log failed token refresh attempts for security auditing.
5. Implement rate limiting on this endpoint to prevent abuse.

</details>
