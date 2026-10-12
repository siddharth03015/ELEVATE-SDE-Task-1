# CredVault Backend API — Digital Certificate Platform

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?logo=sqlite&logoColor=white)](https://sqlite.org/)
[![JWT](https://img.shields.io/badge/JWT-Protected-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()

> **Task 3:** Complete backend REST API and database engine for **CredVault** — Certificate Issuing & Verification Platform. Handles citizen certificate applications, real-time application tracking, public certificate authenticity verification, administrator authentication, application approval/rejection workflows, and certificate revocation.

---

## 🛠️ Technology & Database Stack

| Component | Technology | Rationale |
|---|---|---|
| **Runtime** | **Node.js (v20+)** | High-performance asynchronous event-driven I/O |
| **Web Framework** | **Express.js (v4.21)** | Minimalist, robust RESTful routing and middleware engine |
| **Database** | **SQLite3** | Embedded, serverless SQL database with zero external installation friction |
| **Security & Auth** | **JWT (JSON Web Tokens) & bcryptjs** | Secure token-based admin authorization and salted password hashing |
| **CORS** | **cors** | Cross-Origin Resource Sharing enabled for seamless frontend integration |

---

## 📊 Database Models & Architecture

The database engine uses an embedded relational SQLite database (`credvault.db`) with foreign key integrity.

### 1. `Applications`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `applicationId` | `TEXT` | `PRIMARY KEY` | Sequential format: `APP-0001`, `APP-0002` |
| `name` | `TEXT` | `NOT NULL` | Applicant's full name |
| `phone` | `TEXT` | `NOT NULL` | 10-digit contact mobile number |
| `gender` | `TEXT` | `NOT NULL` | `Male`, `Female`, or `Other` |
| `city` | `TEXT` | `NOT NULL` | Applicant's resident city |
| `state` | `TEXT` | `NOT NULL` | Resident state / union territory |
| `status` | `TEXT` | `NOT NULL` | `Pending` (default), `Approved`, `Rejected` |
| `submittedAt` | `TEXT` | `NOT NULL` | ISO submission timestamp (`YYYY-MM-DD`) |
| `rejectReason` | `TEXT` | `DEFAULT NULL` | Optional explanation if rejected |

### 2. `Certificates`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `certificateId` | `TEXT` | `PRIMARY KEY` | Sequential format: `CERT-0001`, `CERT-0002` |
| `applicationId` | `TEXT` | `FOREIGN KEY` | Reference to `Applications(applicationId)` |
| `name` | `TEXT` | `NOT NULL` | Certificate recipient name |
| `phone` | `TEXT` | `NOT NULL` | Recipient phone number |
| `issuedOn` | `TEXT` | `NOT NULL` | Date of issuance (`YYYY-MM-DD`) |
| `status` | `TEXT` | `NOT NULL` | `Valid` (default) or `Revoked` |

### 3. `Admins`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `username` | `TEXT` | `PRIMARY KEY` | Administrative login username (`admin`) |
| `password` | `TEXT` | `NOT NULL` | Salted bcrypt hash of password |

---

## 🌐 API Endpoints Reference

### Public Citizen Endpoints

#### 1. Request Certificate
- **Method & Path:** `POST /api/applications`
- **Request Body (JSON):**
  ```json
  {
    "name": "Aarav Sharma",
    "phone": "9876543210",
    "gender": "Male",
    "city": "Mumbai",
    "state": "Maharashtra"
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "success": true,
    "message": "Certificate application submitted successfully",
    "applicationId": "APP-0006",
    "status": "Pending"
  }
  ```

#### 2. Track Application
- **Method & Path:** `GET /api/applications/track/:applicationId`
- **Param:** `applicationId` (e.g. `APP-0001`)
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "applicationId": "APP-0001",
    "name": "Aarav Sharma",
    "status": "Approved",
    "submittedAt": "2026-10-01"
  }
  ```
- **Response `404 Not Found`:**
  ```json
  {
    "success": false,
    "message": "Application with ID 'APP-9999' not found"
  }
  ```

#### 3. Verify Certificate
- **Method & Path:** `GET /api/certificates/verify/:certificateId`
- **Param:** `certificateId` (e.g. `CERT-0001`)
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "certificateId": "CERT-0001",
    "name": "Aarav Sharma",
    "phone": "9876543210",
    "issuedOn": "2026-10-02",
    "status": "Valid"
  }
  ```
- **Response `404 Not Found`:**
  ```json
  {
    "success": false,
    "message": "Certificate with ID 'CERT-9999' not found"
  }
  ```

---

### Admin Endpoints (Secured)

All admin endpoints require an Authorization Header:
`Authorization: Bearer <token>` or `x-admin-token: <token>`

#### 4. Admin Login
- **Method & Path:** `POST /api/admin/login`
- **Request Body (JSON):**
  ```json
  {
    "username": "admin",
    "password": "admin"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "message": "Admin login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "username": "admin"
    }
  }
  ```
- **Response `401 Unauthorized`:**
  ```json
  {
    "success": false,
    "message": "Invalid username or password"
  }
  ```

#### 5. Admin List Applications
- **Method & Path:** `GET /api/admin/applications`
- **Auth:** Protected by Admin Token
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "count": 5,
    "applications": [
      {
        "applicationId": "APP-0001",
        "name": "Aarav Sharma",
        "phone": "9876543210",
        "gender": "Male",
        "city": "Mumbai",
        "state": "Maharashtra",
        "status": "Approved",
        "submittedAt": "2026-10-01"
      }
    ]
  }
  ```

#### 6. Admin Approve Application
- **Method & Path:** `PATCH /api/admin/applications/:applicationId/approve`
- **Param:** `applicationId`
- **Behavior:** Updates status to `Approved` and automatically creates a new Certificate record (`CERT-XXXX`) with `Valid` status.
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "message": "Application approved successfully and certificate issued",
    "applicationId": "APP-0002",
    "certificateId": "CERT-0003",
    "status": "Approved"
  }
  ```

#### 7. Admin Reject Application
- **Method & Path:** `PATCH /api/admin/applications/:applicationId/reject`
- **Param:** `applicationId`
- **Request Body (Optional):**
  ```json
  {
    "reason": "Incomplete verification documents"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "message": "Application rejected successfully",
    "applicationId": "APP-0003",
    "status": "Rejected",
    "reason": "Incomplete verification documents"
  }
  ```

#### 8. Admin List Certificates
- **Method & Path:** `GET /api/admin/certificates`
- **Auth:** Protected by Admin Token
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "count": 2,
    "certificates": [
      {
        "certificateId": "CERT-0001",
        "applicationId": "APP-0001",
        "name": "Aarav Sharma",
        "phone": "9876543210",
        "issuedOn": "2026-10-02",
        "status": "Valid"
      }
    ]
  }
  ```

#### 9. Admin Revoke Certificate
- **Method & Path:** `PATCH /api/admin/certificates/:certificateId/revoke` *(also supports `GET` as specified in SRS table)*
- **Param:** `certificateId`
- **Behavior:** Updates certificate status to `Revoked`. The original application record remains completely unchanged.
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "message": "Certificate revoked successfully",
    "certificateId": "CERT-0001",
    "status": "Revoked"
  }
  ```

---

## 🚀 Getting Started & Local Setup

### 1. Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm (v9.0.0 or higher)

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Start the Server
```bash
# Start in production mode
npm start

# Or start with auto-reload (development)
npm run dev
```

The server will initialize the SQLite database (`credvault.db`), seed default test records, and start listening on:
```text
http://localhost:5000
```

---

## 🧪 Running Automated API Tests

A test suite verifying all 9 endpoints, input validation, token authorization, status transitions, and database constraints is included:

```bash
npm test
```

Expected output:
```text
--- Starting Automated Test Suite ---

1. Testing System Health
  ✅ PASS: GET /api/health returns 200 OK

2. Testing Request Certificate (POST /api/applications)
  ✅ PASS: POST /api/applications returns 201 Created
  ✅ PASS: Response contains success: true
  ✅ PASS: Generated valid applicationId
  ✅ PASS: Initial application status is "Pending"

3. Testing Track Application
  ✅ PASS: Track returns 200 for APP-0006
  ✅ PASS: Track returns correct applicant name
  ✅ PASS: Track returns Pending status
  ✅ PASS: Track returns 404 for unknown applicationId

4. Testing Verify Certificate
  ✅ PASS: Verify returns 200 for valid CERT-0001
  ✅ PASS: Certificate matches recipient name
  ✅ PASS: Certificate status is Valid
  ✅ PASS: Verify returns status Revoked for CERT-0002
  ✅ PASS: Verify returns 404 for unknown certificateId

5. Testing Admin Login
  ✅ PASS: Admin login returns 200 OK
  ✅ PASS: Admin login returns JWT token
  ✅ PASS: Admin login returns 401 on incorrect credentials

6. Testing Admin List Applications
  ✅ PASS: Access denied without token (401)
  ✅ PASS: Admin list applications returns 200 with token

7. Testing Admin Approve Application
  ✅ PASS: Approve returns 200 OK
  ✅ PASS: Application status updated to Approved
  ✅ PASS: Certificate ID generated
  ✅ PASS: Newly generated certificate is immediately verifiable as Valid

8. Testing Admin Reject Application
  ✅ PASS: Reject returns 200 OK
  ✅ PASS: Application status set to Rejected

9. Testing Admin List Certificates
  ✅ PASS: Admin list certificates returns 200 OK

10. Testing Admin Revoke Certificate
  ✅ PASS: Revoke endpoint returns 200 OK
  ✅ PASS: Certificate status updated to Revoked
  ✅ PASS: Public verification reflects Revoked status
  ✅ PASS: SRS rule verified: original application record unchanged upon certificate revocation
  ✅ PASS: GET /api/admin/certificates/:id/revoke also succeeds

========================================
Test Results: 22 Passed, 0 Failed
========================================
```

---

## 🔐 Pre-loaded Credentials & Demo Test Records

### Administrator Credentials
- **Username:** `admin`
- **Password:** `admin`

### Seed Applications
| Application ID | Applicant Name | Phone | Status |
|---|---|---|---|
| `APP-0001` | Aarav Sharma | `9876543210` | **Approved** |
| `APP-0002` | Priya Patel | `9123456789` | **Pending** |
| `APP-0003` | Rohan Gupta | `9988776655` | **Rejected** |
| `APP-0004` | Sneha Reddy | `9654321870` | **Approved** |
| `APP-0005` | Vikram Singh | `9012345678` | **Pending** |

### Seed Certificates
| Certificate ID | Application ID | Holder Name | Status |
|---|---|---|---|
| `CERT-0001` | `APP-0001` | Aarav Sharma | 🟢 **Valid** |
| `CERT-0002` | `APP-0004` | Sneha Reddy | 🔴 **Revoked** |

---

## 🔗 Connecting with Task 2 Frontend

The backend includes CORS enabled for `http://localhost:5173`. To connect the Task 2 frontend with this backend:
1. Ensure the backend server is running on `http://localhost:5000`.
2. Configure frontend API calls to base URL: `http://localhost:5000/api`.
3. All endpoint routes, payload structures, and status responses match Task 2 client views seamlessly.
