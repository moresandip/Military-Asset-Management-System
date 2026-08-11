# Military Asset Management System

An enterprise-grade Military Asset Management System tracking critical military assets (vehicles, weapons, ammunition, equipment) across multiple military installations with real-time balance calculations, atomic cross-base transfers, Role-Based Access Control (RBAC), and central security audit logging.

---

## 1. Core Mathematical Inventory Model

The system solves operational asset accounting using dynamic aggregation:

$$\text{Closing Balance} = \text{Opening Balance} + \text{Net Movement} - \text{Assigned} - \text{Expended}$$

$$\text{Net Movement} = \text{Purchases} + \text{Transfers In} - \text{Transfers Out}$$

- **Opening Balance**: Baseline inventory level.
- **Purchases (+)**: New procurement stock intakes.
- **Transfers In (+)**: Assets transferred in from other military installations.
- **Transfers Out (-)**: Assets transferred out to other military installations.
- **Assigned Assets (-)**: Active equipment issued to personnel or operational units.
- **Expended Assets (-)**: Consumed ammunition rounds, training wear, or field loss.

---

## 2. Technical Stack

- **Frontend**: React 18 (Vite template), Tailwind CSS (Dark Tactical Command theme), Lucide React (icons), Recharts (data visualizations), Axios (HTTP API client).
- **Backend**: Node.js, Express.js (ES Modules), JSON-backed Relational Database Engine with full ACID transaction support (`BEGIN...COMMIT`).
- **Security & RBAC**: JSON Web Tokens (JWT), Bcrypt password hashing, Custom Base Scope Enforcement middleware.

---

## 3. Key System Features

- **End-to-End Asset Visibility**: Real-time aggregation of balances per military installation and equipment category.
- **Interactive Net Movement Pop-up**: Clickable Net Movement card in the dashboard opening a detailed breakdown modal.
- **Atomic Cross-Base Transfers**: Database transactions (`BEGIN...COMMIT`) ensuring stock subtractions at origin and additions at destination execute atomically.
- **Role-Based Access Control (RBAC)**:
  - `ADMIN`: Unrestricted global command access across all bases.
  - `BASE_COMMANDER`: Restricted strictly to viewing and managing their assigned military base.
  - `LOGISTICS_OFFICER`: Primary authorization for logging stock purchases and cross-base transfers.
- **Automated Security Audit Trail**: Intercepts all asset mutations and authentication attempts into an immutable security audit log.

---

## 4. Sample Test Credentials Matrix

> [!TIP]
> Use the **Demo Switch** toolbar buttons in the top navigation bar or sign in with the following test credentials:

| Role | Username | Password | Assigned Installation Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin_user` | `AdminPass123!` | All Bases (Global Command) |
| **Base Commander** | `commander_alpha` | `CommandPass123!` | Fort Alpha Command (Base #1) |
| **Base Commander** | `commander_bravo` | `CommandPass123!` | Fort Bravo Forward Base (Base #2) |
| **Logistics Officer** | `logistics_officer` | `LogisticsPass123!` | Base #1 / Global Operations |

---

## 5. API Endpoints Reference

| Method | Endpoint | Description | Allowed Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | User authentication & JWT signing | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Authenticated |
| `GET` | `/api/assets/dashboard-metrics` | Compute dynamic inventory metrics | Authenticated |
| `GET` | `/api/assets/bases` | List all military installations | Authenticated |
| `GET` | `/api/assets/equipment-types` | List all equipment categories | Authenticated |
| `GET` | `/api/purchases` | List procurement history | Authenticated |
| `POST` | `/api/purchases` | Log incoming inventory purchase | `ADMIN`, `LOGISTICS_OFFICER` |
| `GET` | `/api/transfers` | List cross-base transfers | Authenticated |
| `POST` | `/api/transfers` | Execute atomic cross-base transfer | `ADMIN`, `LOGISTICS_OFFICER`, `BASE_COMMANDER` |
| `GET` | `/api/ops/assignments` | List duty assignments | Authenticated |
| `POST` | `/api/ops/assignments` | Issue equipment to personnel | `ADMIN`, `BASE_COMMANDER`, `LOGISTICS_OFFICER` |
| `PATCH` | `/api/ops/assignments/:id/return` | Mark equipment returned | `ADMIN`, `BASE_COMMANDER` |
| `GET` | `/api/ops/expenditures` | List asset expenditures | Authenticated |
| `POST` | `/api/ops/expenditures` | Log consumed ammunition / wear | `ADMIN`, `BASE_COMMANDER`, `LOGISTICS_OFFICER` |
| `GET` | `/api/audit-logs` | Fetch system security audit trail | `ADMIN`, `BASE_COMMANDER` |

---

## 6. Installation & Running Locally

### Prerequisites
- Node.js (v18.x or higher)
- npm (v9.x or higher)

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed     # Populate database with military bases, equipment & test users
npm run dev      # Starts Express API server on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Starts React Vite SPA on http://localhost:3000
```

---

## 7. Directory Structure

```plaintext
military-asset-management/
├── backend/
│   ├── config/
│   │   ├── db.js                 # Database engine with ACID transactions & JSON persistence
│   │   └── seed.js               # Database seeder with default military data
│   ├── controllers/
│   │   ├── authController.js     # User authentication logic
│   │   ├── assetController.js    # Stock & inventory aggregation
│   │   ├── purchaseController.js # Purchase transaction handlers
│   │   ├── transferController.js # Cross-base transfer logic
│   │   ├── assignmentController.js # Personnel assignments & expenditures
│   │   └── auditController.js    # Audit log search handlers
│   ├── middlewares/
│   │   ├── authMiddleware.js     # JWT validation
│   │   ├── rbacMiddleware.js     # Role verification & base scope restriction
│   │   └── loggerMiddleware.js   # Automated API audit logging
│   ├── models/
│   │   └── schema.js             # Relational SQL schema definitions
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── assetRoutes.js
│   │   ├── purchaseRoutes.js
│   │   ├── transferRoutes.js
│   │   ├── assignmentRoutes.js
│   │   └── auditRoutes.js
│   ├── .env.example
│   └── server.js                 # Express app initialization
│
├── frontend/
│   ├── public/
│   │   └── shield.svg            # Tactical shield SVG
│   ├── src/
│   │   ├── assets/
│   │   │   └── logo.svg          # Tactical command logo asset
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Top header with RBAC role switcher
│   │   │   ├── Sidebar.jsx       # RBAC-driven menu navigation
│   │   │   ├── StatCard.jsx      # Reusable dashboard metric card
│   │   │   └── NetMoveModal.jsx  # Net movement pop-up detailed view
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx     # Main metrics view & Recharts graphs
│   │   │   ├── Purchases.jsx     # Purchase logging & history table
│   │   │   ├── Transfers.jsx     # Base-to-base atomic transfer management
│   │   │   ├── Assignments.jsx   # Personnel duty assignments & expenditures
│   │   │   ├── AuditLogs.jsx     # Security audit log view
│   │   │   └── Login.jsx         # Sign-in page with preset test credentials
│   │   ├── services/
│   │   │   └── api.js            # Axios instance with auth interceptors
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global user state management
│   │   ├── App.jsx               # React Router configuration & guards
│   │   └── main.jsx
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```
#   M i l i t a r y - A s s e t - M a n a g e m e n t - S y s t e m  
 