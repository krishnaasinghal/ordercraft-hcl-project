# OrderCraft: Manufacturing Order Management System (OMS)

A web-based **Manufacturing Order Management System (OMS)** automating the complete **Order-to-Cash (O2C)** workflow: customer order processing, dynamic Bill of Materials (BOM) explosion, purchase order generation, inventory replenishment, GST commercial invoicing, and accounts receivable payment tracking.

---

## 🏭 Manufacturing Order-to-Cash (O2C) Workflow

OrderCraft models the real-world lifecycle of high-mix, engineer-to-order, and assemble-to-order manufacturing operations:

```
[ Customer Order Placed ]
         │
         ▼
[ Draft Manufacturing Order (MO) ]
         │ (Review specifications & priority)
         ▼
[ Confirmed Order ] ────► [ Dynamic BOM Explosion ]
                                   │ (Calculates required raw materials,
                                   │  factors in scrap rate %)
                                   ▼
                       [ Stock Shortage Detection ]
                                   │
                                   ▼
                       [ Auto-Generate Supplier POs ]
                                   │
                                   ▼
                       [ Receive Materials into Stock ]
                                   │
                                   ▼
[ Start Production Run (IN_PRODUCTION) ]
         │ (Assembly, quality inspection, testing)
         ▼
[ Mark Completed (COMPLETED) ]
         │
         ▼
[ Auto-Generate Tax Invoice ] ───► [ Ship & Deliver (DELIVERED) ]
         │ (18% GST, Subtotal, CGST/SGST)
         ▼
[ Record Payments & Settle (PAID) ]
```

---

## 🛠️ Tech Stack & Architecture

- **Backend**: Java 25 LTS, Spring Boot 3.5.x
  - **Security**: Spring Security 6 with stateless JWT Bearer Token authentication & BCrypt password hashing
  - **Data Persistence**: Spring Data JPA / Hibernate with MySQL Dialect
  - **Database Migration**: Flyway SQL Migrations (`V1__init_schema.sql`)
  - **Embedded Option**: H2 Database enabled out-of-the-box for zero-friction local development without requiring external database setup
  - **Production Option**: MySQL 8.0+ supported via `--spring.profiles.active=mysql`
- **Frontend**: Angular 17+ (Standalone Components, RxJS, Reactive Forms)
  - **UI Library**: Angular Material (indigo-navy & teal industrial theme)
  - **Visualizations**: Chart.js 4 (interactive doughnut lifecycle distribution & monthly revenue bar charts)
  - **Architecture**: Core Interceptors (JWT Bearer Injection), Route Guards, Reusable Badges & Dialogs
- **Database Schema**: 12 Normalized Relational Entities with Referential Integrity & Constraints

---

## 📦 Project Structure

```
HCL Project/
├── README.md                          # Comprehensive Documentation
├── ordercraft-backend/                # Spring Boot REST API
│   ├── pom.xml                        # Maven configuration
│   ├── mvnw.cmd / mvnw                # Zero-install Maven Wrapper
│   └── src/main/
│       ├── java/com/ordercraft/
│       │   ├── OrderCraftApplication.java
│       │   ├── config/                # Security, JWT Filter, CORS, DataInitializer
│       │   ├── controller/            # 11 REST API Controllers
│       │   ├── dto/                   # Request, Response, and Mapper Classes
│       │   ├── entity/                # 12 JPA Entities
│       │   ├── enums/                 # Status & Priority Enums
│       │   ├── exception/             # Global Error Handler & Custom Exceptions
│       │   ├── repository/            # 12 Spring Data Repositories
│       │   └── service/               # 11 Business Services (BOM Explosion, Workflow)
│       └── resources/
│           ├── application.properties # Embedded H2 Zero-Config profile
│           ├── application-mysql.properties # Production MySQL profile
│           └── db/migration/V1__init_schema.sql # DDL Migration Script
│
└── ordercraft-frontend/               # Angular 17 SPA
    ├── package.json
    ├── angular.json
    └── src/
        ├── index.html
        ├── main.ts
        ├── styles.scss                # Manufacturing ERP Design System
        └── app/
            ├── app.routes.ts          # Route configuration
            ├── core/                  # Auth Guard, JWT Interceptor, Auth Service
            ├── shared/                # Models, Services, Status Badges, Confirm Dialogs
            └── features/
                ├── auth/              # Login & Register views
                ├── layout/            # Sidebar, Header, Responsive Shell
                ├── dashboard/         # KPI Cards, Chart.js Visualizations
                ├── orders/            # Order List, Dynamic Form, MRP Detail View
                ├── bom/               # BOM Registry & Engineering Form
                ├── products/          # Product Catalog & Category Manager
                ├── purchase-orders/   # PO List, Receiving Workflow
                ├── invoices/          # Commercial Tax Invoices, Printable PDF layout
                ├── payments/          # Payment Receipts & Aging Ledger
                ├── customers/         # Customer Accounts Directory
                └── suppliers/         # Vendor & Supplier Directory
```

---

## 🚀 Prerequisites & Installation Guide

### Prerequisites Checklist

| Component | Minimum Version | Status on this Machine |
|---|---|---|
| **Java JDK** | 25 LTS | ✅ Installed (`C:\Program Files\Java\jdk-25.0.2`) |
| **Node.js** | 18+ or 20+ | ✅ Installed (`v24.13.0`) |
| **npm** | 9+ or 11+ | ✅ Installed (`11.6.2`) |
| **Angular CLI** | 17+ | ✅ Installed (`21.2.24`) |
| **Database** | H2 (built-in) or MySQL 8.0+ | ✅ H2 embedded works with zero setup; MySQL optional |

---

## 🏃 Quick Start (Run in 2 Steps)

### Step 1: Start the Spring Boot Backend

The backend is configured with an **in-memory H2 database by default**. When started, `DataInitializer` automatically provisions demo customers, suppliers, raw materials, manufactured products with active BOMs, orders, and an administrator account!

Open a terminal in `ordercraft-backend/`:

```powershell
cd "c:\Users\Krishna Singhal\Desktop\HCL Project\ordercraft-backend"

# Run with Maven Wrapper (auto-downloads Maven on first run):
.\mvnw.cmd spring-boot:run
```

Set a local JWT signing secret before starting the backend:

```powershell
$env:JWT_SECRET = "replace-with-a-random-secret-at-least-32-characters"
```

*The backend will boot up at `http://localhost:8080`.*

#### (Optional) Running with MySQL Database:
If you prefer running against a real MySQL instance:
1. Create database in MySQL:
   ```sql
   CREATE DATABASE ordercraft;
   CREATE USER 'ordercraft'@'localhost' IDENTIFIED BY 'ordercraft123';
   GRANT ALL PRIVILEGES ON ordercraft.* TO 'ordercraft'@'localhost';
   FLUSH PRIVILEGES;
   ```
2. Run backend with the MySQL profile:
   ```powershell
   .\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=mysql
   ```

---

### Step 2: Start the Angular Frontend

Open a second terminal in `ordercraft-frontend/`:

```powershell
cd "c:\Users\Krishna Singhal\Desktop\HCL Project\ordercraft-frontend"

# Install dependencies (first time only)
npm install --legacy-peer-deps

# Start development server
npm start
# or: ng serve --port 4200
```

*The frontend will run at `http://localhost:4200`.*

---

## 🔑 Default Credentials

Login to OrderCraft with pre-seeded credentials:
- **Username**: `admin`
- **Password**: `admin123`

*(You can also use the **Register** screen to create new manufacturing manager accounts).*

---

## 📑 Core Modules & Workflow Walkthrough

### 1. Executive Operations Dashboard
- Real-time KPI tiles for **Total Orders**, **Revenue Realized**, **Pending Purchase Orders**, and **Overdue Invoices**.
- **Interactive Chart.js Doughnut Chart**: Live distribution of orders by lifecycle stage.
- **Monthly Revenue Bar Chart**: Historical Order-to-Cash realization.
- Alerts for **Low Stock Raw Materials** falling below safety reorder levels.

### 2. Product Catalog & Bill of Materials (BOM)
- Define finished manufactured items (SKU, selling price, category, unit of measure).
- Multi-item engineering BOMs with component raw materials, quantity ratios per unit, and scrap factors (%).
- Version management (e.g. `V1.0`, `V2.1`) and status lifecycle (`DRAFT`, `ACTIVE`, `OBSOLETE`).

### 3. Manufacturing Orders & BOM Explosion
- Create customer orders with batch quantities, priority, and scheduled completion due dates.
- **One-Click BOM Explosion**: Aggregates gross raw material requirements across all ordered line items, cross-references live warehouse stock, and calculates shortages.
- **Auto-Generate Purchase Orders**: Instantly groups material shortages by preferred supplier and creates draft POs with procurement cost estimations.
- Status progression: `DRAFT` ➔ `CONFIRMED` ➔ `IN_PRODUCTION` ➔ `COMPLETED` ➔ `DELIVERED`.

### 4. Supplier Purchase Orders & Receiving
- PO tracking from `DRAFT` ➔ `SENT` ➔ `ACKNOWLEDGED` ➔ `RECEIVED`.
- **Receive Goods Workflow**: Automatically credits received component quantities directly into raw materials inventory stock.

### 5. Commercial Invoicing & Payment Reconciliation
- Generates official GST tax invoices from completed manufacturing orders with customizable tax rates (default 18% GST).
- Print-ready commercial invoice layout with Buyer/Seller GSTINs, HSN codes, and bank remittance coordinates.
- Record payment settlements against invoices (NEFT, RTGS, UPI, Cheque, Card).
- Auto-reconciles invoice status from `SENT` ➔ `PARTIALLY_PAID` ➔ `PAID`.
