# Naprocs EMS — Assets KPI API Documentation

This document defines the backend API specifications for the Key Performance Indicator (KPI) endpoints of the **Assets** module in the Naprocs Employee Management System (EMS). 

These endpoints are designed to feed real-time monitoring dashboards used by **IT Admins, HR Managers, CHRO, CTO, CFO, and the CEO** to track asset inventories, allocation metrics, damage rates, financial expenditures, and lifecycle trends.

---

## 1. Authentication & Network Requirements

- **Base URL Prefix**: `/api/v1` (as per Phase 1 standards)
- **Base Route**: `/api/v1/assets/kpis`
- **Network Scope**: VPN-only. Access is restricted to the AWS Client VPN CIDR. Traffic must pass through the Application Load Balancer (ALB) terminating TLS 1.3.
- **Headers**:
  - `Authorization: Bearer <JWT_ACCESS_TOKEN>` (Short-lived 15-minute JWT)
  - `X-Device-Fingerprint: <FINGERPRINT>` (Required for session integrity checking)

---

## 2. RBAC Permission Mapping

Based on the **RBAC Permission Matrix** (Section 9.4 of the Master Document), the endpoints require specific permission definitions. Since the assets module is in Phase 1, we propose introducing the following permissions:
- `READ_ASSETS_KPI`: Required to access organizational asset KPI reports.
- `READ_ASSETS`: Required to read individual or team asset allocations.
- `WRITE_ASSETS`: Required to create, update, or assign assets.

### Access Control Matrix for Assets KPI endpoints:
| Role | Access Level | Description |
| :--- | :---: | :--- |
| **Super Admin** | **Allowed** | Full organizational access |
| **IT Admin** | **Allowed** | Full operational access to monitor inventory and utilization |
| **CEO** | **Allowed** | Executive "God View" of total asset valuations and operational status |
| **CHRO** | **Allowed** | HR-wide asset health and allocation tracking |
| **CTO** | **Allowed** | Technical equipment tracking (laptops, software licenses, cloud accounts) |
| **HR** | **Allowed** | All-department visibility to coordinate onboarding/offboarding logistics |
| **Finance** | **Allowed (Financial KPI only)** | CFO/Finance can access the Financial Valuation endpoint |
| **Manager** | *Denied* | No access to global KPI metrics |
| **Employee** | *Denied* | No access to global KPI metrics |

---

## 3. Data Schema Context & Enums

The metrics calculations reference the following database models and enums defined in `schema.prisma`:

### Enums
- **`AssetCategory`**: `LAPTOP`, `DESKTOP`, `MONITOR`, `MOBILE_DEVICE`, `SIM`, `ACCESS_CARD`, `SOFTWARE_LICENCE`, `CLOUD_ACCOUNT`, `OTHER`
- **`AssetStatus`**: `AVAILABLE`, `ASSIGNED`, `LOST`, `DAMAGED`, `REPLACED`, `RETIRED`

### Core Formulae
1. **Asset Allocation (Utilization) Rate**:
   $$\text{Utilization Rate (\%)} = \left( \frac{\text{Assigned Assets}}{\text{Total Active Assets}} \right) \times 100$$
   *Note: Active Assets are defined as those with status NOT equal to `RETIRED` or `REPLACED`.*
2. **Asset Damage Rate**:
   $$\text{Damage Rate (\%)} = \left( \frac{\text{Damaged Assets}}{\text{Total Assets Owned}} \right) \times 100$$

---

## 4. API Endpoint Specifications

```mermaid
graph TD
    A[/api/v1/assets/kpis] --> B[GET /summary]
    A --> C[GET /categories]
    A --> D[GET /financials]
    A --> E[GET /trends]
```

### 4.1 Get Assets Summary KPIs
Returns top-level, high-value counts and key utilization rates across the organization.

* **Endpoint Name**: Get Assets Summary KPIs
* **Method**: `GET`
* **URL**: `/api/v1/assets/kpis/summary`
* **Decorators**: 
  - `@UseGuards(JwtAuthGuard, RolesGuard)`
  - `@Permissions(Permission.READ_ASSETS_KPI)`
* **Request**:
  - **Headers**: JWT Access Token
  - **Body**: None
  - **Query Params**: None
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Asset summary KPIs retrieved successfully",
    "data": {
      "totalAssetsCount": 150,
      "allocationRate": 82.54,
      "countsByStatus": {
        "AVAILABLE": 20,
        "ASSIGNED": 110,
        "LOST": 2,
        "DAMAGED": 5,
        "REPLACED": 3,
        "RETIRED": 10
      },
      "pendingWorkflowRequests": 8
    }
  }
  ```
* **Error Responses**:
  * **401 Unauthorized**: JWT token is missing, expired, or invalid.
  * **403 Forbidden**: Role does not have the `READ_ASSETS_KPI` permission.
  * **500 Internal Server Error**: Database connection timeout or internal query failure.

---

### 4.2 Get Assets Category Breakdown
Provides breakdown metrics categorized by physical and digital resource types. Useful for supply planning and software license management.

* **Endpoint Name**: Get Assets Category Breakdown
* **Method**: `GET`
* **URL**: `/api/v1/assets/kpis/categories`
* **Decorators**: 
  - `@UseGuards(JwtAuthGuard, RolesGuard)`
  - `@Permissions(Permission.READ_ASSETS_KPI)`
* **Request**:
  - **Headers**: JWT Access Token
  - **Body**: None
  - **Query Params**: None
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Asset category breakdown retrieved successfully",
    "data": [
      {
        "category": "LAPTOP",
        "totalCount": 85,
        "assignedCount": 70,
        "availableCount": 10,
        "damagedCount": 3,
        "lostCount": 1,
        "retiredCount": 1,
        "utilizationRate": 83.33
      },
      {
        "category": "SOFTWARE_LICENCE",
        "totalCount": 30,
        "assignedCount": 28,
        "availableCount": 2,
        "damagedCount": 0,
        "lostCount": 0,
        "retiredCount": 0,
        "utilizationRate": 93.33
      },
      {
        "category": "MONITOR",
        "totalCount": 20,
        "assignedCount": 12,
        "availableCount": 8,
        "damagedCount": 0,
        "lostCount": 0,
        "retiredCount": 0,
        "utilizationRate": 60.00
      }
    ]
  }
  ```
* **Error Responses**:
  * **401 Unauthorized**: JWT token is missing, expired, or invalid.
  * **403 Forbidden**: User role lacks permission.
  * **500 Internal Server Error**: Server or database error.

---

### 4.3 Get Assets Financial Summary (Cost & Valuation)
Computes Capital Expenditure (CapEx) values locked in hardware/software, current active inventory valuation, and losses incurred.

* **Endpoint Name**: Get Assets Financial Summary
* **Method**: `GET`
* **URL**: `/api/v1/assets/kpis/financials`
* **Decorators**: 
  - `@UseGuards(JwtAuthGuard, RolesGuard)`
  - `@Permissions(Permission.READ_ASSETS_KPI)` (Also accessible by `FINANCE` or `CFO` roles)
* **Request**:
  - **Headers**: JWT Access Token
  - **Body**: None
  - **Query Params**: None
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Asset financial summary retrieved successfully",
    "data": {
      "currency": "INR",
      "totalInvestment": 4500000.00,
      "activeValuation": 4120000.00,
      "lossValuation": {
        "LOST": 120000.00,
        "DAMAGED": 150000.00,
        "RETIRED": 110000.00
      },
      "expenditureByCategory": {
        "LAPTOP": 3400000.00,
        "MONITOR": 450000.00,
        "MOBILE_DEVICE": 350000.00,
        "SOFTWARE_LICENCE": 200000.00,
        "OTHER": 100000.00
      }
    }
  }
  ```
* **Error Responses**:
  * **401 Unauthorized**: Invalid credentials.
  * **403 Forbidden**: Lacks permission.
  * **500 Internal Server Error**: Internal database aggregation calculation error.

---

### 4.4 Get Asset Health and Lifecycle Trends
Exposes historical trend data to detect peaks in damages, onboarding assignment rates, and rate of retirement.

* **Endpoint Name**: Get Asset Health and Lifecycle Trends
* **Method**: `GET`
* **URL**: `/api/v1/assets/kpis/trends`
* **Decorators**: 
  - `@UseGuards(JwtAuthGuard, RolesGuard)`
  - `@Permissions(Permission.READ_ASSETS_KPI)`
* **Request**:
  - **Headers**: JWT Access Token
  - **Body**: None
  - **Query Params**:
    * `startDate` (string, optional, ISO-8601 YYYY-MM-DD): Filter trends start range. Defaults to 6 months ago.
    * `endDate` (string, optional, ISO-8601 YYYY-MM-DD): Filter trends end range. Defaults to current date.
    * `interval` (string, optional, `MONTH` | `QUARTER`): Grouping interval. Defaults to `MONTH`.
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Asset lifecycle trends retrieved successfully",
    "data": {
      "interval": "MONTH",
      "trendData": [
        {
          "period": "2026-04",
          "assetsProcured": 12,
          "assignmentsCreated": 18,
          "returnsProcessed": 4,
          "reportedDamaged": 1,
          "reportedLost": 0
        },
        {
          "period": "2026-05",
          "assetsProcured": 25,
          "assignmentsCreated": 30,
          "returnsProcessed": 10,
          "reportedDamaged": 2,
          "reportedLost": 1
        },
        {
          "period": "2026-06",
          "assetsProcured": 8,
          "assignmentsCreated": 12,
          "returnsProcessed": 15,
          "reportedDamaged": 1,
          "reportedLost": 0
        }
      ]
    }
  }
  ```
* **Error Responses**:
  * **400 Bad Request**: Invalid date format or unrecognized interval query parameter.
  * **401 Unauthorized**: Missing or expired auth token.
  * **403 Forbidden**: Denied access.
  * **500 Internal Server Error**: Internal database group-by/aggregation error.

---

## 5. Technical Implementation Details (Prisma Backend Hints)

For the NestJS developer constructing `assets.service.ts`, here are key Prisma snippets to fetch data for the controller:

### Summary KPIs Query
```typescript
const totalAssetsCount = await this.prisma.asset.count();
const statusGroups = await this.prisma.asset.groupBy({
  by: ['status'],
  _count: {
    _all: true
  }
});
const activeAssetsCount = await this.prisma.asset.count({
  where: {
    status: {
      notIn: [AssetStatus.RETIRED, AssetStatus.REPLACED]
    }
  }
});
const assignedAssetsCount = await this.prisma.asset.count({
  where: { status: AssetStatus.ASSIGNED }
});
const allocationRate = activeAssetsCount > 0 
  ? (assignedAssetsCount / activeAssetsCount) * 100 
  : 0;
```

### Financial Calculations Query
```typescript
const aggregations = await this.prisma.asset.aggregate({
  _sum: {
    purchaseCost: true
  }
});
const lostAndDamagedSums = await this.prisma.asset.groupBy({
  by: ['status'],
  where: {
    status: {
      in: [AssetStatus.LOST, AssetStatus.DAMAGED, AssetStatus.RETIRED]
    }
  },
  _sum: {
    purchaseCost: true
  }
});
```
