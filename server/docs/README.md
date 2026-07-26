This directory contains module-wise documentation for the **MediLocker — NFC Based Smart Patient Health Card System**.

## 📚 Module Documentation

- [Authentication Module](./auth.md) - JWT-based authentication and OTP login
- [User Management](./user-management.md) - User profiles and role management
- [NFC Card Module](./nfc-card.md) - Smart health card operations
- [Hospital Desktop App](./hospital-desktop.md) - Electron + React desktop application for hospital staff
- [Patient Mobile App](./patient-mobile.md) - Flutter mobile app for patients (MediLocker)
- [Backend API](./backend-api.md) - Node.js + Express backend services
- [Database Schema](./database.md) - PostgreSQL database structure (managed via Prisma ORM)
- [Database Design](./database-design.md) - Full ER diagram, design decisions, and data flow
- [File Storage](./file-storage.md) - Medical file storage
- [Security](./security.md) - Security implementation and best practices
- [Deployment](./deployment.md) - Production deployment guide
- [NFC Implementation Summary](./NFC_IMPLEMENTATION_SUMMARY.md) - End-to-end NFC card reading flow

## 🏗️ System Architecture

The system is a **monorepo (pnpm workspaces)** containing three distinct but interconnected applications:

| Component | Technology | Audience | Purpose |
|---|---|---|---|
| **Central Server** | Node.js + Express + TypeScript + PostgreSQL (Prisma) | Internal | REST API, FCM push notifications, Twilio OTP |
| **Desktop App** | Electron 28 + React 18 + TypeScript | Doctors & Hospital Staff | NFC card check-in, patient registration, consultations |
| **Mobile App (MediLocker)** | Flutter + Dart | Patients | Access clinical records, prescriptions, notifications |

## 📋 Getting Started

1. Start with the [Backend API](./backend-api.md) documentation
2. Review the [Database Design](./database-design.md)
3. Check [Security](./security.md) implementation
4. Follow [Deployment](./deployment.md) guide for production setup