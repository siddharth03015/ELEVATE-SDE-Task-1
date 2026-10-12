# CredVault — Digital Certificate Issuing & Verification Platform

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?logo=sqlite&logoColor=white)](https://sqlite.org/)
[![JWT](https://img.shields.io/badge/JWT-Protected-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()

> **CredVault** is a full-stack digital certificate management and verification platform. It allows citizens to seamlessly apply for certificates, track applications in real-time, and verify credential authenticity. Administrators can review queues, approve applications (auto-issuing verifiable credentials), reject submissions, and revoke certificates.
> 
> The platform includes both a **React 18 + Vite frontend** and a **Node.js + Express + SQLite3 backend REST API engine** with automated test suites.

---

## 📑 Table of Contents

1. [Project Overview](#-project-overview)
2. [Architecture & System Design](#-architecture--system-design)
3. [Key Features](#-key-features)
4. [UML Diagrams & System Specifications](#-uml-diagrams--system-specifications)
   - [1. UML Use Case Diagram](#1-uml-use-case-diagram)
   - [2. UML Class & Domain Model Diagram](#2-uml-class--domain-model-diagram)
   - [3. UML Sequence Diagram: Citizen Flow](#3-uml-sequence-diagram-citizen-flow)
   - [4. UML Sequence Diagram: Admin Issuance Flow](#4-uml-sequence-diagram-admin-issuance-flow)
   - [5. UML State Machine Diagram](#5-uml-state-machine-diagram)
   - [6. UML Full-Stack Component & Data Flow Diagram](#6-uml-full-stack-component--data-flow-diagram)
5. [Backend REST API Specifications](#-backend-rest-api-specifications)
6. [Database Models & Schemas](#-database-models--schemas)
7. [Screenshots & Visual Tour](#-screenshots--visual-tour)
8. [Full-Stack Tech Stack](#-full-stack-tech-stack)
9. [Project Structure](#-project-structure)
10. [Local Setup & Running Instructions](#-local-setup--running-instructions)
11. [Automated API Testing](#-automated-api-testing)
12. [Admin Credentials & Seed Test Records](#-admin-credentials--seed-test-records)
13. [License](#-license)

---

## 🌟 Project Overview

Traditional public document issuance is vulnerable to manual delays, record tampering, and forged physical certificates. **CredVault** delivers a robust digital alternative:

- **Self-Service Citizen Portal:** Public form validation, instant confirmation receipts, and unique tracking IDs (`APP-XXXX`).
- **Real-Time Tracking & Verification:** Sub-millisecond lookup for tracking status and verifying certificate validity (`CERT-XXXX`).
- **Admin Command Center:** Officer audit dashboard with one-click **Approve & Issue**, **Reject**, and **Revoke** controls.
- **Relational Backend Engine:** Express REST APIs backed by SQLite3 (`credvault.db`) with foreign key constraints, automated sequential ID generation, and JWT authentication.

---

## 🏗️ Architecture & System Design

```mermaid
flowchart LR
    subgraph Client ["Client Tier (Port 5173)"]
        SPA["React 18 Single Page App"]
        Vite["Vite Dev / Prod Server"]
        Router["React Router v6"]
    end

    subgraph API ["API Tier (Port 5000)"]
        Express["Express.js Server"]
        AuthMiddleware["JWT Auth Middleware"]
        ValMiddleware["Input Validation"]
        RouterAPI["REST API Router"]
    end

    subgraph Data ["Data Tier"]
        SQLite[("SQLite3 Database\ncredvault.db")]
        Tables["Applications | Certificates | Admins"]
    end

    Client <-->|REST API / JSON| API
    API <-->|SQL Queries| SQLite
    SQLite --- Tables
```

---

## ⚡ Key Features

| Category | Capability | Description |
|---|---|---|
| **Public Services** | 📝 **Certificate Request** | Citizen application form with full validation (Name, 10-digit Phone, State, City, Gender) and immediate receipt modal. |
| | 🔍 **Application Tracking** | Look up application lifecycle status (`Pending`, `Approved`, `Rejected`) by Application ID (`APP-XXXX`). |
| | 🛡️ **Instant Verification** | Public authenticity verification check returning status (`Valid`, `Revoked`), holder details, and issue date. |
| **Admin Operations** | 🔐 **JWT Authentication** | Salted bcrypt passwords and JWT bearer tokens protecting sensitive officer endpoints. |
| | 📂 **Application Management** | Real-time queue review with one-click **Issue** (auto-generates certificate) and **Reject** workflows. |
| | 📜 **Certificate Registry** | Comprehensive credentials ledger with immediate **Revocation** capability. |
| **Data Integrity** | 🔒 **Strict Lifecycle Rules** | When a certificate is revoked, only the certificate status changes to `Revoked`; original application remains intact. |
| | 🧪 **Automated Test Suite** | 34 automated unit/integration tests covering all 9 API endpoints, auth guards, and status transitions. |

---

## 📐 UML Diagrams & System Specifications

---

### 1. UML Use Case Diagram

```mermaid
flowchart LR
    Citizen(["👤 Citizen / Public User"])
    Admin(["👮 System Administrator"])

    subgraph CredVault ["🏛️ CredVault System Boundary"]
        UC1(["UC-1: Apply for Certificate"])
        UC2(["UC-2: Track Application Status"])
        UC3(["UC-3: Verify Certificate Authenticity"])
        UC4(["UC-4: Authenticate (Admin Login)"])
        UC5(["UC-5: Review Application Queue"])
        UC6(["UC-6: Approve Application & Issue Certificate"])
        UC7(["UC-7: Reject Application"])
        UC8(["UC-8: Audit Certificate Registry"])
        UC9(["UC-9: Revoke Issued Certificate"])
    end

    Citizen --> UC1
    Citizen --> UC2
    Citizen --> UC3

    Admin --> UC4
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9

    UC6 -.->|<<includes>>| UC8
    UC9 -.->|<<updates>>| UC3
```

---

### 2. UML Class & Domain Model Diagram

```mermaid
classDiagram
    class ApplicationStatus {
        <<enumeration>>
        Pending
        Approved
        Rejected
    }

    class CertificateStatus {
        <<enumeration>>
        Valid
        Revoked
    }

    class Gender {
        <<enumeration>>
        Male
        Female
        Other
    }

    class Application {
        +String applicationId
        +String name
        +String phone
        +Gender gender
        +String city
        +String state
        +ApplicationStatus status
        +String submittedAt
        +String rejectReason
    }

    class Certificate {
        +String certificateId
        +String applicationId
        +String name
        +String phone
        +String issuedOn
        +CertificateStatus status
    }

    class AdminUser {
        +String username
        +String password
        +login(username, password) Token
    }

    class CredVaultAPI {
        +createApplication(data) Application
        +trackApplication(id) Application
        +verifyCertificate(id) Certificate
        +adminLogin(user, pass) Token
        +listApplications() List~Application~
        +approveApplication(id) Certificate
        +rejectApplication(id, reason) Application
        +listCertificates() List~Certificate~
        +revokeCertificate(id) Certificate
    }

    Application "1" ..> "0..1" Certificate : generates on approval
    Application --> ApplicationStatus : status
    Application --> Gender : gender
    Certificate --> CertificateStatus : status
    CredVaultAPI *-- Application : manages
    CredVaultAPI *-- Certificate : manages
    CredVaultAPI o-- AdminUser : authenticates
```

---

### 3. UML Sequence Diagram: Citizen Flow

```mermaid
sequenceDiagram
    autonumber
    actor Citizen as 👤 Citizen
    participant UI as 📄 Frontend UI (Port 5173)
    participant API as ⚙️ Express Backend (Port 5000)
    participant DB as 💾 SQLite Database

    %% Submit Application
    Citizen->>UI: Fills Form (Name, Phone, State, City, Gender)
    Citizen->>UI: Clicks "Submit Application"
    UI->>UI: Client-Side Validation (10-digit phone, non-empty fields)
    UI->>API: POST /api/applications (JSON payload)
    API->>API: Server-side validation check
    API->>DB: Query max(applicationId) -> Generate 'APP-0006'
    API->>DB: INSERT INTO Applications (APP-0006, 'Pending', ...)
    DB-->>API: Row Committed
    API-->>UI: 201 Created { success: true, applicationId: 'APP-0006', status: 'Pending' }
    UI-->>Citizen: Renders Success Modal with Application ID

    %% Track Application
    Citizen->>UI: Navigates to Track Page & Enters 'APP-0006'
    UI->>API: GET /api/applications/track/APP-0006
    API->>DB: SELECT * FROM Applications WHERE applicationId = 'APP-0006'
    DB-->>API: Returns Application Record
    API-->>UI: 200 OK { applicationId, name, status: 'Pending', submittedAt }
    UI-->>Citizen: Displays Status Card with Pending Badge
```

---

### 4. UML Sequence Diagram: Admin Issuance Flow

```mermaid
sequenceDiagram
    autonumber
    actor Admin as 👮 Administrator
    participant UI as 🖥️ Admin Dashboard
    participant API as ⚙️ Express Backend
    participant DB as 💾 SQLite Database
    actor Citizen as 👤 Citizen
    participant VerifyUI as 🛡️ Verification Portal

    %% Admin Login
    Admin->>UI: Enters admin / admin
    UI->>API: POST /api/admin/login
    API->>DB: SELECT password FROM Admins WHERE username = 'admin'
    API->>API: bcrypt.compare(password, hash)
    API-->>UI: 200 OK { token: "JWT_TOKEN" }

    %% Approve Application
    Admin->>UI: Clicks "Issue Certificate" for 'APP-0002'
    UI->>API: PATCH /api/admin/applications/APP-0002/approve (Bearer Token)
    API->>API: Verify JWT Token
    API->>DB: UPDATE Applications SET status = 'Approved' WHERE applicationId = 'APP-0002'
    API->>DB: Generate 'CERT-0003'
    API->>DB: INSERT INTO Certificates (CERT-0003, APP-0002, status='Valid')
    DB-->>API: Changes Committed
    API-->>UI: 200 OK { applicationId: 'APP-0002', certificateId: 'CERT-0003', status: 'Approved' }
    UI-->>Admin: Table Row Updates to "Approved"

    %% Verification by Citizen
    Citizen->>VerifyUI: Enters 'CERT-0003'
    VerifyUI->>API: GET /api/certificates/verify/CERT-0003
    API->>DB: SELECT * FROM Certificates WHERE certificateId = 'CERT-0003'
    DB-->>API: Returns Certificate Record
    API-->>VerifyUI: 200 OK { certificateId: 'CERT-0003', name, phone, issuedOn, status: 'Valid' }
    VerifyUI-->>Citizen: Displays Green Authenticated Certificate Card

    %% Revocation by Admin
    Admin->>UI: Clicks "Revoke" on 'CERT-0003'
    UI->>API: PATCH /api/admin/certificates/CERT-0003/revoke (Bearer Token)
    API->>DB: UPDATE Certificates SET status = 'Revoked' WHERE certificateId = 'CERT-0003'
    DB-->>API: Changes Committed
    API-->>UI: 200 OK { certificateId: 'CERT-0003', status: 'Revoked' }
    UI-->>Admin: Status Badge reflects "Revoked"
```

---

### 5. UML State Machine Diagram

```mermaid
stateDiagram-v2
    direction TB

    state "Application Lifecycle" as AppLifecycle {
        [*] --> Draft : User fills form
        Draft --> Pending : Form submitted (POST /api/applications)
        
        state Pending {
            description: "Awaiting administrative review"
        }

        Pending --> Approved : Officer Approves (PATCH /approve)
        Pending --> Rejected : Officer Rejects (PATCH /reject)

        state Approved {
            description: "Auto-creates Certificate with Valid status"
        }

        state Rejected {
            description: "Terminal rejection with reason"
        }

        Approved --> [*]
        Rejected --> [*]
    }

    state "Certificate Lifecycle" as CertLifecycle {
        [*] --> Valid : Generated upon Application Approval
        
        state Valid {
            description: "Authentic & Verifiable"
        }

        Valid --> Revoked : Officer Revokes (PATCH/GET /revoke)

        state Revoked {
            description: "Flagged Invalid during public verification"
        }

        Revoked --> [*]
    }
```

---

### 6. UML Full-Stack Component & Data Flow Diagram

```mermaid
flowchart TB
    subgraph Presentation_Layer ["🎨 Frontend Client (React 18 + Vite : 5173)"]
        HP["HomePage (/)"]
        RP["RequestPage (/request)"]
        TP["TrackPage (/track)"]
        VP["VerifyPage (/verify)"]
        ALP["AdminLoginPage (/admin/login)"]
        AAP["AdminApplicationsPage (/admin/applications)"]
        ACP["AdminCertificatesPage (/admin/certificates)"]
    end

    subgraph Service_Layer ["⚙️ Backend REST API (Express : 5000)"]
        AUTH["JWT Auth Guard"]
        VALID["Input Validator"]
        AppRoutes["/api/applications Routes"]
        CertRoutes["/api/certificates Routes"]
        AdminRoutes["/api/admin Routes"]
    end

    subgraph Persistence_Layer ["💾 SQLite3 Database (credvault.db)"]
        T_APP[("Applications Table")]
        T_CERT[("Certificates Table")]
        T_ADM[("Admins Table")]
    end

    RP -->|POST /applications| VALID --> AppRoutes --> T_APP
    TP -->|GET /track/:id| AppRoutes --> T_APP
    VP -->|GET /verify/:id| CertRoutes --> T_CERT
    ALP -->|POST /login| VALID --> AdminRoutes --> T_ADM
    AAP -->|GET /applications| AUTH --> AdminRoutes --> T_APP
    AAP -->|PATCH /approve| AUTH --> AdminRoutes --> T_APP & T_CERT
    AAP -->|PATCH /reject| AUTH --> AdminRoutes --> T_APP
    ACP -->|GET /certificates| AUTH --> AdminRoutes --> T_CERT
    ACP -->|PATCH/GET /revoke| AUTH --> AdminRoutes --> T_CERT
```

---

## 🌐 Backend REST API Specifications

The backend server exposes **9 RESTful endpoints** matching the ELEVATE specification:

| # | Endpoint | Method | Auth | Body / Params | Response |
|---|---|---|---|---|---|
| **1** | `/api/applications` | `POST` | Public | `{ name, phone, gender, city, state }` | `201 Created`: `{ success, applicationId, status: "Pending" }` |
| **2** | `/api/applications/track/:applicationId` | `GET` | Public | Param: `applicationId` | `200 OK`: `{ applicationId, name, status, submittedAt }` or `404` |
| **3** | `/api/certificates/verify/:certificateId` | `GET` | Public | Param: `certificateId` | `200 OK`: `{ certificateId, name, phone, issuedOn, status }` or `404` |
| **4** | `/api/admin/login` | `POST` | Public | `{ username, password }` | `200 OK`: `{ token, admin: { username } }` or `401` |
| **5** | `/api/admin/applications` | `GET` | Bearer Token | None | `200 OK`: `{ count, applications: [...] }` |
| **6** | `/api/admin/applications/:applicationId/approve` | `PATCH` | Bearer Token | Param: `applicationId` | `200 OK`: Sets `Approved`, creates `CERT-XXXX` with `Valid` |
| **7** | `/api/admin/applications/:applicationId/reject` | `PATCH` | Bearer Token | Param: `applicationId`, optional `{ reason }` | `200 OK`: Sets `Rejected` with reason |
| **8** | `/api/admin/certificates` | `GET` | Bearer Token | None | `200 OK`: `{ count, certificates: [...] }` |
| **9** | `/api/admin/certificates/:certificateId/revoke` | `PATCH` / `GET` | Bearer Token | Param: `certificateId` | `200 OK`: Sets `Revoked` *(Original app record unchanged)* |

---

## 🗄️ Database Models & Schemas

The backend uses embedded SQLite (`credvault.db`) with foreign key constraints:

### 1. `Applications` Table
```sql
CREATE TABLE Applications (
  applicationId TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  gender TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Approved', 'Rejected')),
  submittedAt TEXT NOT NULL,
  rejectReason TEXT DEFAULT NULL
);
```

### 2. `Certificates` Table
```sql
CREATE TABLE Certificates (
  certificateId TEXT PRIMARY KEY,
  applicationId TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  issuedOn TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Valid' CHECK(status IN ('Valid', 'Revoked')),
  FOREIGN KEY (applicationId) REFERENCES Applications(applicationId)
);
```

### 3. `Admins` Table
```sql
CREATE TABLE Admins (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL
);
```

---

## 📸 Screenshots & Visual Tour

### 1. Home Page (`/`)
![Home Page](screenshots/01-homepage.png)

### 2. Request Certificate (`/request`)
![Request Form](screenshots/02-request-form.png)

### 3. Application Submission Success Modal
![Success Modal](screenshots/03-success-modal.png)

### 4. Track Application (`/track`)
![Track Application](screenshots/04-track-application.png)

### 5. Verify Certificate (`/verify`)
![Verify Certificate](screenshots/05-verify-certificate.png)

### 6. Admin Applications Management (`/admin/applications`)
![Admin Applications](screenshots/06-admin-applications.png)

### 7. Admin Certificate Registry (`/admin/certificates`)
![Admin Certificates](screenshots/07-admin-certificates.png)

---

## 🛠️ Full-Stack Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend Framework** | **React** | `18.x` | Declarative component UI |
| **Build & Dev Server** | **Vite** | `5.x` | Instant HMR and asset bundling |
| **Routing** | **React Router** | `v6` | Client-side routing and layout rendering |
| **Icons** | **Lucide React** | `1.55+` | Clean SVG iconography |
| **Backend Runtime** | **Node.js** | `20+` | Asynchronous JavaScript runtime |
| **API Framework** | **Express.js** | `4.21+` | RESTful routing and middleware engine |
| **Database** | **SQLite3** | `5.1+` | Zero-config embedded relational database |
| **Authentication** | **JWT & bcryptjs** | `9.0 / 2.4` | Bearer token authorization and salted hashing |
| **Styling** | **Vanilla CSS3** | Modern | Glassmorphism, CSS variables, and responsive layout |

---

## 📁 Project Structure

```
CredVault/
├── backend/                           # ⚙️ Dedicated Backend Project (Task 3)
│   ├── .env                           # Environment configuration (Port 5000, JWT Secret)
│   ├── .env.example                   # Configuration template
│   ├── .gitignore                     # Git ignore rules (node_modules, db files)
│   ├── package.json                   # Dependencies & npm scripts
│   ├── README.md                      # Backend specific API reference
│   ├── test-api.js                    # 34-assertion automated test suite
│   ├── credvault.db                   # SQLite database file
│   └── src/
│       ├── server.js                  # Express app, middleware & route mounting
│       ├── db.js                      # Database adapter, schemas & sequential ID generators
│       ├── middleware/
│       │   ├── auth.js                # JWT & Bearer token guard
│       │   └── validation.js          # Request payload validators
│       └── routes/
│           ├── applicationRoutes.js   # Citizen application routes
│           ├── certificateRoutes.js   # Certificate verification routes
│           └── adminRoutes.js         # Admin authorization & management routes
├── screenshots/                       # 📸 High-resolution UI screenshots (Task 2)
│   ├── 01-homepage.png
│   ├── 02-request-form.png
│   ├── 03-success-modal.png
│   ├── 04-track-application.png
│   ├── 05-verify-certificate.png
│   ├── 06-admin-applications.png
│   └── 07-admin-certificates.png
├── src/                               # 🎨 React Frontend Client (Task 2)
│   ├── main.jsx                       # Entrypoint
│   ├── App.jsx                        # Route configuration
│   ├── index.css                      # Global styles & design system
│   ├── context/AppContext.jsx         # Global state & LocalStorage engine
│   ├── components/                    # Navbar, Footer, PageWrapper
│   └── pages/                         # All 7 frontend application views
├── package.json                       # Frontend dependencies & scripts
├── vite.config.js                     # Vite build configuration
└── README.md                          # Full-stack documentation
```

---

## 🚀 Local Setup & Running Instructions

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Running the Frontend Portal (Port 5173)
```powershell
# Open terminal in root directory
cd "e:\Elevate Skills"

# Install dependencies (first time only)
npm install

# Start Vite dev server
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** in your browser.

### 3. Running the Backend API Server (Port 5000)
```powershell
# Open terminal in backend directory
cd "e:\Elevate Skills\backend"

# Install dependencies (first time only)
npm install

# Start the Express API server
npm start
```
The server will initialize the SQLite database (`credvault.db`), seed sample records, and start on **[http://localhost:5000](http://localhost:5000)**.
Health check: **[http://localhost:5000/api/health](http://localhost:5000/api/health)**

---

## 🧪 Automated API Testing

Run the automated integration test suite from the backend directory:

```powershell
cd "e:\Elevate Skills\backend"
npm test
```

### Test Suite Results:
```text
========================================
Test Results: 34 Passed, 0 Failed
========================================
```
The test suite covers:
- System health checks
- Valid and invalid application submissions
- Application tracking by ID & 404 handling
- Public certificate verification (Valid, Revoked, 404)
- Admin login (Valid JWT generation & 401 rejection)
- Protected route authentication guards
- Application approval and sequential certificate generation
- Application rejection with custom reason
- Certificate revocation and validation that original application record remains unchanged
- Both `PATCH` and `GET` revocation endpoint compatibility

---

## 🔐 Admin Credentials & Seed Test Records

### Administrator Credentials
- **Username:** `admin`
- **Password:** `admin`

### Seed Applications
| Application ID | Applicant Name | Initial Status |
|---|---|---|
| `APP-0001` | Aarav Sharma | **Approved** |
| `APP-0002` | Priya Patel | **Pending** |
| `APP-0003` | Rohan Gupta | **Rejected** |
| `APP-0004` | Sneha Reddy | **Approved** |
| `APP-0005` | Vikram Singh | **Pending** |

### Seed Certificates
| Certificate ID | Application ID | Recipient Name | Initial Status |
|---|---|---|---|
| `CERT-0001` | `APP-0001` | Aarav Sharma | 🟢 **Valid** |
| `CERT-0002` | `APP-0004` | Sneha Reddy | 🔴 **Revoked** |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
