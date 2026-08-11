<div align="center">

# 🛡️ KRISTALLBALL
### Military Asset Management System

[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express.js-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

> An enterprise-grade system for tracking critical military assets — vehicles, weapons, ammunition, and equipment — across multiple military installations with real-time balance calculations, atomic cross-base transfers, Role-Based Access Control (RBAC), and a central security audit trail.

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Core Inventory Model](#-core-inventory-model)
- [Tech Stack](#-tech-stack)
- [Key Features](#-key-features)
- [Role-Based Access Control](#-role-based-access-control)
- [Test Credentials](#-test-credentials)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)

---

## 🔍 Overview

**KRISTALLBALL** is a full-stack military asset management platform designed for secure, real-time tracking of defense inventory across geographically distributed military bases. It enforces strict RBAC policies, logs every action to an immutable audit trail, and ensures inventory consistency through ACID-compliant database transactions.

---

## 📐 Core Inventory Model

The system computes asset balances dynamically using the following formula:

$$\text{Closing Balance} = \text{Opening Balance} + \text{Net Movement} - \text{Assigned} - \text{Expended}$$

$$\text{Net Movement} = \text{Purchases} + \text{Transfers In} - \text{Transfers Out}$$

| Term | Symbol | Description |
|:-----|:------:|:------------|
| Opening Balance | `OB` | Baseline inventory level at period start |
| Purchases | `+P` | New procurement stock intakes |
| Transfers In | `+TI` | Assets received from other installations |
| Transfers Out | `−TO` | Assets dispatched to other installations |
| Assigned Assets | `−A` | Equipment issued to personnel or units |
| Expended Assets | `−E` | Consumed ammunition, training wear, or field loss |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|:-----------|:-------:|:--------|
| React | 18.x | UI Framework |
| Vite | 5.x | Build tool & dev server |
| Tailwind CSS | 3.x | Dark Tactical Command theme |
| Recharts | 2.x | Data visualizations & graphs |
| Lucide React | latest | Icon library |
| Axios | 1.x | HTTP API client with interceptors |

### Backend
| Technology | Version | Purpose |
|:-----------|:-------:|:--------|
| Node.js | 18.x | Runtime environment |
| Express.js | 5.x | REST API framework (ES Modules) |
| JSON DB Engine | custom | ACID-compliant relational data store |
| JWT | 9.x | Stateless authentication tokens |
| Bcrypt | 5.x | Password hashing |

---

## ✨ Key Features

- 🔴 **Real-Time Asset Visibility** — Dynamic balance aggregation per installation and equipment category
- 🔄 **Atomic Cross-Base Transfers** — `BEGIN…COMMIT` transactions guarantee consistency between origin and destination
- 📊 **Interactive Dashboard** — Recharts-powered graphs with clickable Net Movement breakdown modal
- 🔐 **Role-Based Access Control** — Three-tier RBAC with base-scoped enforcement middleware
- 📝 **Immutable Audit Trail** — Every asset mutation and auth event auto-logged to a tamper-evident security log
- 👥 **Personnel Assignments** — Issue and return equipment to individual soldiers or units
- 💸 **Expenditure Tracking** — Log consumed ammunition rounds, training wear, or operational field loss
- 🌐 **Multi-Installation Support** — Manage assets across any number of geographically separate bases

---

## 🔐 Role-Based Access Control

```
┌─────────────────────────────────────────────────────────┐
│                        RBAC HIERARCHY                    │
│                                                         │
│  ADMIN ──────────────── Global Command (All Bases)      │
│    │                                                     │
│    ├── BASE_COMMANDER ── Single Base Scope               │
│    │       • View & manage assigned base only            │
│    │       • Execute transfers, assignments              │
│    │                                                     │
│    └── LOGISTICS_OFFICER ── Procurement Authority        │
│            • Log purchases & transfers globally          │
│            • No admin/user management access             │
└─────────────────────────────────────────────────────────┘
```

| Role | Purchases | Transfers | Assignments | Expenditures | Audit Logs | User Mgmt |
|:-----|:---------:|:---------:|:-----------:|:------------:|:----------:|:---------:|
| `ADMIN` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `BASE_COMMANDER` | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `LOGISTICS_OFFICER` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

---

## 🔑 Test Credentials

> [!TIP]
> Use the **Demo Switch** buttons in the top navigation bar for one-click role switching, or sign in manually with the credentials below.

| Role | Username | Password | Scope |
|:-----|:---------|:---------|:------|
| **Admin** | `admin_user` | `AdminPass123!` | 🌐 All Bases (Global Command) |
| **Base Commander** | `commander_alpha` | `CommandPass123!` | 🏔️ Fort Alpha Command (Base #1) |
| **Base Commander** | `commander_bravo` | `CommandPass123!` | 🏕️ Fort Bravo Forward Base (Base #2) |
| **Logistics Officer** | `logistics_officer` | `LogisticsPass123!` | 📦 Base #1 / Global Operations |

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description | Access |
|:------:|:---------|:------------|:-------|
| `POST` | `/api/auth/login` | User login & JWT signing | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Authenticated |

### Assets & Dashboard
| Method | Endpoint | Description | Access |
|:------:|:---------|:------------|:-------|
| `GET` | `/api/assets/dashboard-metrics` | Compute real-time inventory metrics | Authenticated |
| `GET` | `/api/assets/bases` | List all military installations | Authenticated |
| `GET` | `/api/assets/equipment-types` | List all equipment categories | Authenticated |

### Purchases
| Method | Endpoint | Description | Access |
|:------:|:---------|:------------|:-------|
| `GET` | `/api/purchases` | List procurement history | Authenticated |
| `POST` | `/api/purchases` | Log incoming inventory purchase | `ADMIN`, `LOGISTICS_OFFICER` |

### Transfers
| Method | Endpoint | Description | Access |
|:------:|:---------|:------------|:-------|
| `GET` | `/api/transfers` | List cross-base transfers | Authenticated |
| `POST` | `/api/transfers` | Execute atomic cross-base transfer | `ADMIN`, `LOGISTICS_OFFICER`, `BASE_COMMANDER` |

### Assignments & Expenditures
| Method | Endpoint | Description | Access |
|:------:|:---------|:------------|:-------|
| `GET` | `/api/ops/assignments` | List duty assignments | Authenticated |
| `POST` | `/api/ops/assignments` | Issue equipment to personnel | `ADMIN`, `BASE_COMMANDER`, `LOGISTICS_OFFICER` |
| `PATCH` | `/api/ops/assignments/:id/return` | Mark equipment as returned | `ADMIN`, `BASE_COMMANDER` |
| `GET` | `/api/ops/expenditures` | List asset expenditures | Authenticated |
| `POST` | `/api/ops/expenditures` | Log consumed assets | `ADMIN`, `BASE_COMMANDER`, `LOGISTICS_OFFICER` |

### Audit
| Method | Endpoint | Description | Access |
|:------:|:---------|:------------|:-------|
| `GET` | `/api/audit-logs` | Fetch system security audit trail | `ADMIN`, `BASE_COMMANDER` |

---

## 📁 Project Structure

```plaintext
Military-Asset-Management-System/
│
├── 📂 backend/
│   ├── 📂 config/
│   │   ├── db.js                    # JSON-backed DB engine with ACID transactions
│   │   └── seed.js                  # Database seeder (bases, equipment, users)
│   │
│   ├── 📂 controllers/
│   │   ├── authController.js        # Login, JWT sign & user profile
│   │   ├── assetController.js       # Dashboard metrics & balance aggregation
│   │   ├── purchaseController.js    # Purchase CRUD handlers
│   │   ├── transferController.js    # Atomic cross-base transfer logic
│   │   ├── assignmentController.js  # Personnel assignments & expenditures
│   │   └── auditController.js       # Audit log query handlers
│   │
│   ├── 📂 middlewares/
│   │   ├── authMiddleware.js        # JWT token validation
│   │   ├── rbacMiddleware.js        # Role & base scope enforcement
│   │   └── loggerMiddleware.js      # Automatic API audit logging
│   │
│   ├── 📂 models/
│   │   └── schema.js                # Relational SQL schema definitions
│   │
│   ├── 📂 routes/
│   │   ├── authRoutes.js
│   │   ├── assetRoutes.js
│   │   ├── purchaseRoutes.js
│   │   ├── transferRoutes.js
│   │   ├── assignmentRoutes.js
│   │   └── auditRoutes.js
│   │
│   ├── .env.example                 # Environment variable template
│   └── server.js                    # Express app entry point
│
├── 📂 frontend/
│   ├── 📂 public/
│   │   └── shield.svg               # Tactical shield favicon
│   │
│   └── 📂 src/
│       ├── 📂 assets/
│       │   └── logo.svg             # Tactical command logo
│       │
│       ├── 📂 components/
│       │   ├── Navbar.jsx           # Top header with RBAC role switcher
│       │   ├── Sidebar.jsx          # RBAC-driven navigation menu
│       │   ├── StatCard.jsx         # Reusable dashboard metric card
│       │   └── NetMoveModal.jsx     # Net movement breakdown modal
│       │
│       ├── 📂 pages/
│       │   ├── Dashboard.jsx        # Main metrics view & Recharts graphs
│       │   ├── Purchases.jsx        # Purchase logging & history table
│       │   ├── Transfers.jsx        # Base-to-base transfer management
│       │   ├── Assignments.jsx      # Personnel assignments & expenditures
│       │   ├── AuditLogs.jsx        # Security audit log viewer
│       │   └── Login.jsx            # Sign-in page with preset credentials
│       │
│       ├── 📂 services/
│       │   └── api.js               # Axios instance with auth interceptors
│       │
│       ├── 📂 context/
│       │   └── AuthContext.jsx      # Global auth state (React Context)
│       │
│       ├── App.jsx                  # React Router config & route guards
│       └── main.jsx                 # Vite entry point
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18.x or higher
- **npm** v9.x or higher
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/moresandip/Military-Asset-Management-System.git
cd Military-Asset-Management-System
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Seed the database with military bases, equipment & test users
npm run seed

# Start the Express API server
npm run dev
# ✅ API running at http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the React Vite dev server
npm run dev
# ✅ App running at http://localhost:3000
```

### 4. Open in Browser

Navigate to **http://localhost:3000** and log in with any [test credential](#-test-credentials).

---

## ⚙️ Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
# Server
PORT=5000

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Database
DB_FILE_PATH=./data/database.json
```

> [!WARNING]
> Never commit your actual `.env` file to version control. The `.gitignore` is already configured to exclude it.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ for Military Operations Management

⭐ **Star this repo** if you found it helpful!

</div>