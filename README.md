# DevERP — Offline-First Freelance Developer ERP & Cash Flow Suite

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows%20Portable%20%7C%20Web-blue.svg)](#desktop-build-instructions)
[![Stack](https://img.shields.io/badge/Stack-React%20%7C%20TypeScript%20%7C%20Vite%20%7C%20Electron-61dafb.svg)](#tech-stack)

> **DevERP** is a standalone, offline-first Enterprise Resource Planning (ERP) and cash flow management terminal tailored specifically for freelance software engineers, independent technical consultants, and digital agency operators.

---

## 🌟 Core Features

- **💼 Client & Project CRM**
  - Comprehensive client directory with custom payment terms (Net 15/30/60) and contact metadata.
  - Milestone-based deliverables tracking with automated status lifecycles (`Pending` → `Completed` → `Billed`).
  - Support for Fixed-Price, Hourly Rate, and Monthly Retainer billing contracts.

- **💱 Multi-Currency Invoicing & Real-Time FX**
  - Seamless operations across **EGP (E£)**, **USD ($)**, and **EUR (€)**.
  - Built-in Foreign Exchange engine with customizable currency conversion rates locked per invoice.
  - Automatic invoice number generator (`INV-YYYY-XXX`) with line item calculation and tax/VAT handling.

- **📄 Built-in PDF Generation Engine**
  - Client-side, pixel-perfect printable invoice generation powered by `jspdf`.
  - Professional invoice templates embedding wire remittance coordinates (IBAN, SWIFT/BIC, Beneficiary Bank) and custom corporate styling.

- **📊 Cash Flow Ledger & Financial Forecasting**
  - Real-time double-entry style inflow/outflow transaction recording.
  - Automatic reconciliation between settled client invoices and cash ledger entries.
  - 30-day runway analysis, active cash flow charts, and monthly burn-rate monitoring.

- **🔒 100% Offline Privacy & Zero Cloud Dependencies**
  - All database entities, invoice records, banking credentials, and client contacts persist exclusively in local browser/client storage (`localStorage`).
  - Zero external database connections, telemetry, or server-side data leaks.

- **💾 Instant Backup & Restore**
  - One-click JSON data export to create complete local backups.
  - Instant JSON database restoration for painless synchronization across multiple development workstations.

---

## 🛠 Tech Stack

- **Frontend Core:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons & UI Assets:** [Lucide React](https://lucide.dev/)
- **PDF Generation:** [jsPDF](https://github.com/parallax/jsPDF)
- **Desktop Runtime:** [Electron](https://www.electronjs.org/)
- **Application Packager:** [electron-builder](https://www.electron.build/)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended)
- `npm` (v10+)

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/IbrahimElmasry/DevERP.git
   cd DevERP
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start the local Vite development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

4. **Launch Electron in development mode:**
   ```bash
   npm run electron:start
   ```

---

## 📦 Desktop Build Instructions

To package the application into a standalone Windows installer (`.exe`):

```bash
npm run electron:build
```

### Build Output:
- The command compiles the frontend via `vite build` and packages it with `electron-builder` using the **NSIS** engine.
- The installer executable is generated in:
  ```text
  dist-electron/DevERP Setup 1.0.0.exe
  ```
- **Instant Launch & Shortcuts:** Configured as a fast one-click installation with automatic Desktop and Start Menu shortcuts, eliminating runtime extraction delays.

---

## 👤 Author & Ownership

**Ibrahim Tarek**
- *Role:* Software Engineer & Consultant
- *Project:* DevERP Lead Architect

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for complete details.
