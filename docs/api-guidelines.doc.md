# REST API Guidelines & Best Practices (1.0)

Welcome to this beginner-friendly guide on **REST API design**! Whether you’re just starting out or already have some experience, this document is here to help you create **clean**, **consistent**, and **easy-to-use APIs**. Let’s dive right in!

<br>

## 📑 Table of Contents 

1. [General Principles](#general-principles)
2. [HTTP Methods](#http-methods)
3. [URL Structure](#url-structure)
4. [Request & Response](#request-response)
5. [Error Handling](#error-handling)
6. [Authentication & Authorization](#authentication-authorization)
7. [Versioning](#versioning)
8. [Security Best Practices](#security-best-practices)
9. [Documentation](#documentation)
10. [Testing](#testing)

<br>

## 🧑‍💻 General Principles

> When designing an API, it’s important to follow some basic principles that make your API **easy to use** and **easy to maintain**. Here are the key points:

* **Consistency**: Stick to the same naming conventions, status codes, and response formats throughout your API.
* **Simplicity**: Keep the API easy to understand. Don’t overcomplicate things.
* **Stateless**: Each API request should contain all the information the server needs to complete the request. The server doesn’t need to remember anything about previous requests.
* **Cacheability**: Your API should be efficient! Mark responses as cacheable when possible to save resources.

<br>

## 💻 HTTP Methods 

You’ll use **HTTP methods** to define what action to take with the data. Here’s a quick guide:

| HTTP Method | Description                  | Example URL       |
| ----------- | ---------------------------- | ----------------- |
| **GET**     | Retrieve data (read-only).   | `GET /users`      |
| **POST**    | Create a new resource.       | `POST /users`     |
| **PUT**     | Update an existing resource. | `PUT /users/1`    |
| **PATCH**   | Partially update a resource. | `PATCH /users/1`  |
| **DELETE**  | Delete a resource.           | `DELETE /users/1` |

### Key points about HTTP methods:

* **GET** doesn’t change anything on the server.
* **POST** is for creating new resources.
* **PUT** updates the whole resource.
* **PATCH** is used for partial updates.
* **DELETE** removes the resource.

<br>

## 🌍 URL Structure 

> URLs should be **simple**, **consistent**, and easy to follow. Here’s how to build them:

### Guidelines:

1. **Use nouns** for resources, not verbs. (We already have HTTP methods for actions!)

   * **Correct**: `GET /users`
   * **Incorrect**: `GET /getUsers`

2. **Use plural names** for collections of resources.

   * **Correct**: `/users`, `/posts`
   * **Incorrect**: `/user`, `/post`

3. **Keep it short & descriptive**.

   * **Good**: `/products?category=electronics&sort=price`
   * **Bad**: `/products/fetchCategory1`

4. **Use slashes to show hierarchy** (relationships between resources).

   * **Example**: `GET /users/1/posts` (Gets posts of user with ID 1)

<br>

## 📡 Request & Response 

### Request 🔄

> When sending a request, make sure to include the necessary **headers** and **data**.

| Header           | Purpose                          | Example                          |
| ---------------- | -------------------------------- | -------------------------------- |
| **Accept**       | What type of response to accept. | `Accept: application/json`       |
| **Content-Type** | Type of data being sent.         | `Content-Type: application/json` |

### Response ✅

> Responses should always be **clear** and **structured**. A typical JSON response looks like this:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User fetched successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "meta": {
    "requestTime": "2025-10-09T12:00:00Z"
  },
  "pagination": {
    "page": 5,
    "limit": 10,
    "totalPages": 25,
    "hasNextPage": true,
    "hasPrevPage": true,
    "nextPage": 6,
    "prevPage": 4,
  }
}
```

### Explanation:

* **success**: A boolean indicating if the request was successful (`true`) or not (`false`).
* **statusCode**: The HTTP status code returned with the response (e.g., `200` for success).
* **message**: A description or message about the request (e.g., "User fetched successfully").
* **data**: The actual data returned from the API (e.g., the user details).
* **meta**: Contains additional information about the request or response, such as timestamps or any other contextual information.
* **pagination**: A separate object that handles pagination details:

  * **page**: The current page number (e.g., `5` means we're on page 5).
  * **limit**: The number of items per page (e.g., `10` means 10 items are shown per page).
  * **totalPages**: The total number of pages available based on the total items and limit (e.g., `25` means there are 25 pages in total).
  * **hasNextPage**: Whether there’s a next page of results (e.g., `true` means there’s a next page).
  * **hasPrevPage**: Whether there’s a previous page of results (e.g., `true` means there’s a previous page).
  * **nextPage**: The page number for the next set of results (e.g., `6`).
  * **prevPage**: The page number for the previous set of results (e.g., `4`).

  * ### Example:
    * You're on **page 5** with **10 items per page**.
    * There are **25 total pages**, so you can go **forward to page 6** or **back to page 4**.

<br>

### HTTP Status Codes 🚦

| Status Code | Meaning                            | Example                                    |
| ----------- | ---------------------------------- | ------------------------------------------ |
| **200**     | OK, everything is fine.            | Successful `GET /users`                    |
| **201**     | Created, resource was created.     | `POST /users` successfully creates a user. |
| **400**     | Bad Request, invalid input.        | Invalid `POST /users` data.                |
| **401**     | Unauthorized, not logged in.       | No valid token in `Authorization`.         |
| **404**     | Not Found, resource doesn't exist. | `GET /users/99` (User not found)           |
| **500**     | Internal Server Error.             | Something went wrong on the server.        |

**📌 Read more about status codes:** [HTTP Status Codes - MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)

<br>

## 🛑 Error Handling 

> When something goes wrong, it’s essential to give the client clear information.

### Key Points:

1. **Use the correct HTTP status code** (e.g., 400, 404, 500).
2. **Provide helpful error messages**.

**Example of a helpful error message:**

```json
{
  "success": false,
  "statusCode": 400,
  "errorCode": "INVALID_EMAIL_FORMAT",
  "isOperational": true,
  "message": "Invalid email format",
  "details": "Email must include '@' and a valid domain name"
}
```

**Meaning:**

* **success:** `false` → the request failed
* **statusCode:** `400` → Bad Request (client-side error)
* **errorCode:** custom code that explains the exact error (useful for frontend devs)
* **isOperational:** `true` → this error is expected and safely handled (not a crash)
* **message:** human-readable reason of the error
* **details:** (optional) extra info if needed


### Common Errors:

| Status Code | Reason                             | Example                            |
| ----------- | ---------------------------------- | ---------------------------------- |
| **400**     | Bad Request, invalid input.        | `"error": "Invalid email format"`  |
| **401**     | Unauthorized, no valid token.      | `"error": "Authentication failed"` |
| **404**     | Not Found, resource doesn't exist. | `"error": "User not found"`        |

<br>

## 🔒 Authentication & Authorization 

### Key Points:

1. **Use JWT (JSON Web Tokens)** for authentication.

   * Example: `Authorization: Bearer <token>`
2. **Implement role-based access control**. Only admins should have access to certain routes (e.g., `DELETE /users`).
3. **Always use HTTPS** to secure communication between client and server.

<br>

## 📅 Versioning 

> API versions help you manage changes to your API over time.

### Key Points:

* **Version in URL**: Include the version number directly in the URL for easy management.

  * Example: `GET /api/v1/users`
* **Deprecate older versions carefully**: Keep older versions working until everyone has transitioned to the new one.

<br>

## 🔐 Security Best Practices 

> APIs need to be **secure** to protect your users’ data.

| Best Practice              | Explanation                                                  |
| -------------------------- | ------------------------------------------------------------ |
| **Validate input**         | Always sanitize incoming data to avoid attacks.              |
| **Use rate limiting**      | Prevent abuse by limiting how many requests a user can make. |
| **Encrypt sensitive data** | Use secure algorithms like bcrypt to hash passwords.         |

<br>

## 📚 Documentation 

> Clear documentation makes your API **user-friendly** for developers.

### Best Practices:

* **Document every endpoint**: Describe what it does, what parameters it takes, and what the response looks like.
* **Include examples**: Show example requests and responses.
* **Keep it up to date**: Make sure your documentation matches the actual API.

<br>

## 🧪 API Testing Guidelines

> To ensure every API endpoint works correctly, returns expected responses, and handles errors gracefully before going to production.

<br>

### **1. General Rules**

* Test **each endpoint** (GET, POST, PUT, DELETE).
* Use **consistent data** for reproducibility.
* Always test both **success** and **failure** scenarios.
* Keep tests **independent** — one test should not depend on another.
* Use **test environment** (e.g., `.env.test`) and **temporary database**.


### **2. Tools**

* **Jest** → test runner and assertion library.
* **Supertest** → to make HTTP requests to your Express app.
* **MongoDB Memory Server** (optional) → for in-memory test DBs.

### **3. File Structure**

```
__tests__/
├── auth.test.js
├── user.test.js
└── health-check.test.js
```

<br>

### **4. Test Naming Conventions**

Use `describe()` and `it()` blocks to make tests read like natural English sentences.

<br>

#### ✅ **`describe()` — groups related tests**

* Name it after the **module, route, or function** being tested.
* Format:

  ```
  describe("<HTTP METHOD> <ENDPOINT>", () => { ... })
  ```

#### ✅ **`it()` — describes a single test case**

* Write it as a **clear expectation** or **behavior**.
* Format:

  ```
  it("should <expected behavior>", () => { ... })
  ```

<br>

### **Examples**

#### For an API route

```js
describe("POST /api/v1/auth/login", () => {
  it("should return 200 when login is successful", async () => {
    // test logic
  });

  it("should return 400 for invalid email format", async () => {
    // test logic
  });

  it("should return 401 for incorrect password", async () => {
    // test logic
  });
});
```

### **Pro Tips**

* Keep `describe` names **short but meaningful**.
* Nest `describe()` blocks for better structure:

  ```js
  describe("Auth Routes", () => {
    describe("POST /login", () => { ... });
    describe("POST /register", () => { ... });
  });
  ```
* **The goal:** your test output should **read like documentation**.

<br>

**In short:**

> Use `describe()` for grouping tests logically and `it()` for describing exact behavior — make your tests talk like a story.

<br>

### **5. Run Tests**

```
npm test
```

### **6. Pro Tips**

* Mock external services (emails, payments).
* Reset DB before each test.
* Keep your tests fast, isolated, and descriptive.

<br>

## Conclusion 🎉

By following these **simple guidelines**, you’ll be able to create **RESTful APIs** that are **easy to use**, **secure**, and **easy to maintain**. Remember, **clarity** and **consistency** are key when building APIs!

_Happy coding!_
