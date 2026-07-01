# Naprocs EMS — Knowledge Base API Documentation

This document defines the backend API specifications for the **Knowledge Base** module in the Naprocs Employee Management System (EMS). 

The Knowledge Base is a centralized repository of company policies, SOPs, architectural guidelines, technical specifications, and training materials. All authenticated employees can view published articles, whereas content creation and curation is restricted to administrative and leadership roles.

---

## 1. Authentication & Network Requirements

- **Base URL Prefix**: `/api/v1`
- **Base Route**: `/api/v1/knowledge`
- **Network Scope**: VPN-only. Access is restricted to the AWS Client VPN CIDR. Traffic must pass through the Application Load Balancer (ALB) terminating TLS 1.3.
- **Headers**:
  - `Authorization: Bearer <JWT_ACCESS_TOKEN>` (Short-lived 15-minute JWT)

---

## 2. RBAC Permission Mapping

Access control is strictly validated in the service layer using the authenticated user's role.

- **Read Access (Published Articles)**: Granted to all roles.
- **Read Access (Draft/Unpublished Articles)**: Restricted to Content Authors/Admins.
- **Write Access (Create/Update/Delete/Publish)**: Restricted to the following roles:
  - `SUPER_ADMIN`
  - `CEO`
  - `CTO`
  - `COO`
  - `OPERATIONS_HEAD`
  - `CHRO`
  - `HR`
  - `IT`

---

## 3. Data Schema Context & Enums

The API references the following enums defined in `schema.prisma`:

### `KnowledgeCategory`
- `POLICY`
- `SOP`
- `ARCHITECTURE`
- `TECHNICAL_DOC`
- `HR_GUIDELINES`
- `TRAINING_MATERIAL`
- `COMPLIANCE`

---

## 4. API Endpoint Specifications

```mermaid
graph TD
    A[/api/v1/knowledge] --> B[POST /]
    A --> C[GET /]
    A --> D[GET /id/:id]
    A --> E[GET /slug/:slug]
    A --> F[PATCH /:id]
    A --> G[DELETE /:id]
    A --> H[PATCH /:id/publish]
```

### 4.1 Create Knowledge Document
Creates a new document in the knowledge base. The slug is generated automatically based on the title if not provided. The `searchVector` is updated immediately for indexed search.

* **Method**: `POST`
* **URL**: `/api/v1/knowledge`
* **Authentication**: JWT token matching a role with Write Access.
* **Request Body** (JSON):
  ```json
  {
    "title": "Backend Architecture Standards",
    "content": "Detailed guidelines on NestJS modules, Prisma, and Redis setup...",
    "category": "ARCHITECTURE",
    "isPublished": false,
    "version": "1.0",
    "slug": "backend-architecture-standards" // Optional, auto-generated if missing
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "id": "clz4b21j30000x2s0v7b6r9w1",
    "authorId": "clz4b12j10000x2s0v7b6r9a1",
    "category": "ARCHITECTURE",
    "content": "Detailed guidelines on NestJS modules, Prisma, and Redis setup...",
    "createdAt": "2026-07-01T11:15:00.000Z",
    "isPublished": false,
    "publishedAt": null,
    "slug": "backend-architecture-standards-x4y2",
    "title": "Backend Architecture Standards",
    "updatedAt": "2026-07-01T11:15:00.000Z",
    "version": "1.0",
    "author": {
      "id": "clz4b12j10000x2s0v7b6r9a1",
      "firstName": "John",
      "lastName": "Doe",
      "officialEmail": "john.doe@naprocs.com"
    }
  }
  ```
* **Status Codes**:
  - `201 Created`: Document created successfully.
  - `400 Bad Request`: Missing mandatory fields or invalid category.
  - `401 Unauthorized`: Missing or expired authentication token.
  - `403 Forbidden`: Insufficient permissions (user role does not have Write Access).
  - `409 Conflict`: Slug already exists in the database.

---

### 4.2 Search & List Knowledge Documents
Lists or searches documents. Support full-text search against title and content, and filtering by category and publication status.

* **Method**: `GET`
* **URL**: `/api/v1/knowledge`
* **Authentication**: Required (any valid role).
* **Request Parameters** (Query String):
  - `q` (string, optional): Full-text search term. Uses Postgres full-text parser.
  - `category` (string, optional): Valid `KnowledgeCategory` value.
  - `isPublished` (boolean, optional): Filter by publish status. Ignored/forced to `true` for standard employees.
* **Success Response (200 OK)**:
  ```json
  [
    {
      "id": "clz4b21j30000x2s0v7b6r9w1",
      "title": "Backend Architecture Standards",
      "slug": "backend-architecture-standards-x4y2",
      "category": "ARCHITECTURE",
      "content": "Detailed guidelines on NestJS modules, Prisma, and Redis setup...",
      "isPublished": true,
      "publishedAt": "2026-07-01T11:16:00.000Z",
      "version": "1.0",
      "authorId": "clz4b12j10000x2s0v7b6r9a1",
      "author": {
        "id": "clz4b12j10000x2s0v7b6r9a1",
        "firstName": "John",
        "lastName": "Doe",
        "officialEmail": "john.doe@naprocs.com"
      }
    }
  ]
  ```
* **Status Codes**:
  - `200 OK`: Search query processed successfully.
  - `401 Unauthorized`: Missing or expired authentication token.

---

### 4.3 Get Knowledge Document by ID
Retrieves a single document by its database ID.

* **Method**: `GET`
* **URL**: `/api/v1/knowledge/id/:id`
* **Authentication**: Required.
* **Path Parameters**:
  - `id` (string, required): The ID of the document.
* **Success Response (200 OK)**:
  ```json
  {
    "id": "clz4b21j30000x2s0v7b6r9w1",
    "authorId": "clz4b12j10000x2s0v7b6r9a1",
    "category": "ARCHITECTURE",
    "content": "Detailed guidelines on NestJS modules, Prisma, and Redis setup...",
    "createdAt": "2026-07-01T11:15:00.000Z",
    "isPublished": true,
    "publishedAt": "2026-07-01T11:16:00.000Z",
    "slug": "backend-architecture-standards-x4y2",
    "title": "Backend Architecture Standards",
    "updatedAt": "2026-07-01T11:17:00.000Z",
    "version": "1.1",
    "author": {
      "id": "clz4b12j10000x2s0v7b6r9a1",
      "firstName": "John",
      "lastName": "Doe",
      "officialEmail": "john.doe@naprocs.com"
    }
  }
  ```
* **Status Codes**:
  - `200 OK`: Document found and returned.
  - `401 Unauthorized`: Missing or expired authentication token.
  - `403 Forbidden`: Standard employee trying to view an unpublished draft.
  - `404 NotFound`: Document not found.

---

### 4.4 Get Knowledge Document by Slug
Retrieves a single document by its URL slug.

* **Method**: `GET`
* **URL**: `/api/v1/knowledge/slug/:slug`
* **Authentication**: Required.
* **Path Parameters**:
  - `slug` (string, required): The unique slug of the document.
* **Success Response (200 OK)**:
  (Matches the schema of Section 4.3)
* **Status Codes**:
  - `200 OK`: Document found and returned.
  - `401 Unauthorized`: Missing or expired authentication token.
  - `403 Forbidden`: Standard employee trying to view an unpublished draft.
  - `404 NotFound`: Document not found.

---

### 4.5 Update Knowledge Document
Updates fields of an existing document. Re-compiles `searchVector` if title or content are modified.

* **Method**: `PATCH`
* **URL**: `/api/v1/knowledge/:id`
* **Authentication**: JWT token matching a role with Write Access.
* **Request Body** (JSON, all fields optional):
  ```json
  {
    "title": "Updated Architecture Standards",
    "content": "Brand new guidelines on monorepos...",
    "category": "ARCHITECTURE",
    "version": "1.2"
  }
  ```
* **Success Response (200 OK)**:
  (Matches the schema of Section 4.3 with modified values)
* **Status Codes**:
  - `200 OK`: Document updated successfully.
  - `400 Bad Request`: Invalid payload parameters.
  - `401 Unauthorized`: Missing or expired authentication token.
  - `403 Forbidden`: Insufficient permissions.
  - `404 NotFound`: Document not found.
  - `409 Conflict`: Slug conflict.

---

### 4.6 Delete Knowledge Document
Permanently deletes a document from the database.

* **Method**: `DELETE`
* **URL**: `/api/v1/knowledge/:id`
* **Authentication**: JWT token matching a role with Write Access.
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Document deleted successfully"
  }
  ```
* **Status Codes**:
  - `200 OK`: Document deleted successfully.
  - `401 Unauthorized`: Missing or expired authentication token.
  - `403 Forbidden`: Insufficient permissions.
  - `404 NotFound`: Document not found.

---

### 4.7 Publish / Unpublish Knowledge Document
Updates the publication status of a document. Sets `publishedAt` to the current timestamp when publishing, and to `null` when unpublishing.

* **Method**: `PATCH`
* **URL**: `/api/v1/knowledge/:id/publish`
* **Authentication**: JWT token matching a role with Write Access.
* **Request Body** (JSON):
  ```json
  {
    "isPublished": true
  }
  ```
* **Success Response (200 OK)**:
  (Matches the schema of Section 4.3 with modified `isPublished` and `publishedAt` fields)
* **Status Codes**:
  - `200 OK`: Publication status updated successfully.
  - `400 Bad Request`: Missing `isPublished` field in request body.
  - `401 Unauthorized`: Missing or expired authentication token.
  - `403 Forbidden`: Insufficient permissions.
  - `404 NotFound`: Document not found.
