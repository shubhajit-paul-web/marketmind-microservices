# Auth service

The Auth Service is a microservice of the MarketMind eCommerce platform that handles user authentication and authorization, ensuring secure access across the system.

## Overview

- This service handles:
- User authentication (login, signup, logout, update account, change or forgot password, token refresh, get users, etc.)
- Role-based access control (RBAC)
- Application and system health monitoring

_The service is designed to operate as a stand-alone microservice within a distributed system._

<br>

## ⚙️ API Reference

> All endpoints follow the platform’s authentication and access rules.

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

- You can use this endpoint to:
- Monitor app uptime and memory usage
- Integrate with health monitoring tools (e.g., Grafana, Prometheus, Datadog)
- Implement load balancer health checks
- Validate deployment stability after CI/CD pipeline runs

</details>

<details>
    <summary><b>Expected HTTP Status Codes</b></summary>

| Status Code                 | Meaning                                                    |
| --------------------------- | ---------------------------------------------------------- |
| `200 OK`                    | Application and system health data retrieved successfully. |
| `500 Internal Server Error` | Server error occurred while fetching health information.   |

</details>
